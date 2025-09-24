const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME || "TheRealEstate";
const PORT = process.env.PORT || 5000;

if (!MONGO_URI) {
  console.error("❌ Missing MONGO_URI in .env");
  process.exit(1);
}

let db;

/* -----------------------------------
   DB connect, then start the server
----------------------------------- */
async function connectDB() {
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log(`✅ Connected to MongoDB: ${DB_NAME}`);

    // helpful index for activity feed
    db.collection("Activity").createIndex({ createdAt: -1 }).catch(() => {});

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("DB connection failed", err);
    process.exit(1);
  }
}
connectDB();

/* -----------------------------------
   Helpers
----------------------------------- */
// Prototype “who is acting” via query params.
function getActor(req) {
  return {
    actorId: req.query.actorId ? String(req.query.actorId) : null,
    actorRole: req.query.role ? String(req.query.role) : "manager",
    actorEmail: req.query.actorEmail ? String(req.query.actorEmail) : null,
  };
}

// Write one activity row
async function logActivity({ action, entity, entityId, message, diff }, actor) {
  try {
    await db.collection("Activity").insertOne({
      action,                     // 'created' | 'updated' | 'deleted'
      entity,                     // 'Client' | 'Agent' | 'Property' | ...
      entityId: entityId ? String(entityId) : null,
      message: message || null,
      diff: diff || null,
      actorId: actor?.actorId || null,
      actorRole: actor?.actorRole || null,
      actorEmail: actor?.actorEmail || null,
      createdAt: new Date(),
    });
  } catch (e) {
    console.error("Failed to log activity:", e);
  }
}

// Read role/agentId from query
function callerFromQuery(req) {
  const role = (req.query.role || "manager").toString().toLowerCase();
  const agentId = req.query.agentId ? String(req.query.agentId) : null; // string IDs
  return { role, agentId };
}

/* -----------------------------------
   Health
----------------------------------- */
app.get("/health", (_req, res) => res.json({ ok: true }));

/* -----------------------------------
   Agents
----------------------------------- */
// Get all agents
app.get("/api/agents", async (_req, res) => {
  try {
    const agents = await db.collection("Agents").find({}).toArray();
    res.json(agents);
  } catch (err) {
    console.error("Failed to fetch agents:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create agent + log activity
app.post("/api/agents", async (req, res) => {
  try {
    const actor = getActor(req);

    const {
      name, email, phone, dateHired, status,
      notes, username, password,
      clients = [], properties = [], assignedClients = [], assignedProperties = []
    } = req.body;

    if (!name || !email || !status) {
      return res.status(400).json({ error: "Name, email, and status are required" });
    }

    const collection = db.collection("Agents");
    const cleanEmail = email.trim().toLowerCase();

    const existing = await collection.findOne({ email: cleanEmail });
    if (existing) return res.status(409).json({ error: "Agent with this email already exists" });

    const newAgent = {
      name,
      email: cleanEmail,
      phone: phone || "",
      dateHired: dateHired || "",
      status,
      notes: notes || "",
      username: username || "",
      password: password || "",
      clients,
      properties,
      assignedClients,
      assignedProperties,
      createdAt: new Date(),
    };

    const result = await collection.insertOne(newAgent);
    const created = await collection.findOne({ _id: result.insertedId });

    await logActivity(
      { action: "created", entity: "Agent", entityId: created?._id, message: `Agent created: ${created?.name || created?._id}` },
      actor
    );

    res.status(201).json(created);
  } catch (err) {
    console.error("Failed to add agent:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update agent + log activity
app.put("/api/agents/:id", async (req, res) => {
  try {
    const actor = getActor(req);
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid agent ID" });

    const updates = { ...req.body };
    if (typeof updates.email === "string") updates.email = updates.email.trim().toLowerCase();

    const result = await db.collection("Agents").updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: "Agent not found" });

    const updated = await db.collection("Agents").findOne({ _id: new ObjectId(id) });

    await logActivity(
      { action: "updated", entity: "Agent", entityId: id, message: `Agent updated: ${updated?.name || id}`, diff: Object.keys(updates || {}) },
      actor
    );

    res.json(updated);
  } catch (err) {
    console.error("Failed to update agent:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete agent + log activity
app.delete("/api/agents/:id", async (req, res) => {
  try {
    const actor = getActor(req);
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid agent ID" });

    const toDelete = await db.collection("Agents").findOne({ _id: new ObjectId(id) });
    const result = await db.collection("Agents").deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: "Agent not found" });

    await logActivity(
      { action: "deleted", entity: "Agent", entityId: id, message: `Agent deleted: ${toDelete?.name || id}` },
      actor
    );

    res.json({ message: "Agent deleted successfully" });
  } catch (err) {
    console.error("Failed to delete agent:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* -----------------------------------
   Clients + Metrics (query-scoped)
----------------------------------- */
// Get one client
app.get("/api/client/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid client ID" });
    const client = await db.collection("Clients").findOne({ _id: new ObjectId(id) });
    if (!client) return res.status(404).json({ error: "Client not found" });
    res.json(client);
  } catch (err) {
    console.error("Error fetching client:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// List clients (manager = all; agent = only assigned)
app.get("/api/clients", async (req, res) => {
  try {
    const { role, agentId } = callerFromQuery(req);
    const { tier, search } = req.query;

    const filter = {};
    if (role === "agent") {
      if (!agentId) return res.status(400).json({ error: "agentId is required when role=agent" });
      filter.assignedAgents = { $in: [String(agentId)] }; // string IDs
    }
    if (tier) filter.tier = String(tier);
    if (search) {
      const rx = new RegExp(String(search), "i");
      filter.$or = [{ fullName: rx }, { email: rx }, { phoneNumber: rx }];
    }

    const clients = await db.collection("Clients")
      .find(filter)
      .project({
        fullName: 1, email: 1, phoneNumber: 1, tier: 1,
        assignedAgents: 1, interestedProperties: 1,
        preferredLanguage: 1, purpose: 1,
      })
      .toArray();

    res.json(clients);
  } catch (err) {
    console.error("Failed to fetch clients:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Clients metrics (counts by tier)
app.get("/api/clients/metrics", async (req, res) => {
  try {
    const { role, agentId } = callerFromQuery(req);
    const match = {};
    if (role === "agent") {
      if (!agentId) return res.status(400).json({ error: "agentId is required when role=agent" });
      match.assignedAgents = { $in: [String(agentId)] };
    }

    const byTier = await db.collection("Clients").aggregate([
      { $match: match },
      { $group: { _id: "$tier", count: { $sum: 1 } } }
    ]).toArray();

    const map = byTier.reduce((acc, d) => {
      acc[d._id || "Unknown"] = d.count;
      return acc;
    }, {});
    const totalLeads = byTier.reduce((s, d) => s + d.count, 0);

    res.json({
      totalLeads,
      hotLeads: map["Hot"] || 0,
      warmLeads: map["Warm"] || 0,
      coldLeads: map["Cold"] || 0,
    });
  } catch (err) {
    console.error("Failed to fetch metrics:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* -----------------------------------
   Activity feed
----------------------------------- */
app.get("/api/activity", async (req, res) => {
  try {
    const { role, agentId } = callerFromQuery(req);
    const days = Number(req.query.days) || 7;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const match = { createdAt: { $gte: since } };
    if (role === "agent") {
      if (!agentId) return res.status(400).json({ error: "agentId is required when role=agent" });
      match.actorId = String(agentId);
    }

    const items = await db.collection("Activity")
      .find(match)
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    res.json(items);
  } catch (err) {
    console.error("Failed to fetch activity:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* -----------------------------------
   Properties (public read)
----------------------------------- */
app.get("/api/property/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid property ID" });
    const property = await db.collection("Properties").findOne({ _id: new ObjectId(id) });
    if (!property) return res.status(404).json({ error: "Property not found" });
    res.json(property);
  } catch (err) {
    console.error("Error fetching property:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
