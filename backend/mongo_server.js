const express = require("express");
const { MongoClient,  ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const cors = require("cors");
const { ApifyClient } = require("apify-client");
const nodemailer = require("nodemailer");
const OpenAI = require("openai")
// const bcrypt = require("bcrypt");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors()); 

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME || "TheRealEstate";
const JWT_SECRET = process.env.JWT_SECRET || "supersecretjwtkey";
const PORT = process.env.PORT || 5000;

let db;
async function connectDB() {
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log(`Connected to MongoDB: ${DB_NAME}`);
  } catch (err) {
    console.error("DB connection failed", err);
    process.exit(1);
  }
}
connectDB();


function generateToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: "1d" } // token lasts 1 day
  );
}

// -------------------------
// ROUTES
// -------------------------

// Login 
app.post("/api/login", async (req, res) => {
  const { role, email, password } = req.body;

  if (!role || !email || !password) {
    return res
      .status(400)
      .json({ error: "Role, email, and password are required" });
  }

  try {
    const collection = db.collection(role === "manager" ? "Managers" : "Agents");

    const cleanEmail = email.trim().toLowerCase();
    const user = await collection.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // If storing hashed passwords, use: await bcrypt.compare(password, user.password)
    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    user.role = role; // attach role into user object (so token has role info)

    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        role,
        name: user.fullName || user.name || user.username,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all agents
app.get("/api/agents", async (req, res) => {
  try {
    const collection = db.collection("Agents");
    const agents = await collection.find({}).toArray();
    res.json(agents);
  } catch (err) {
    console.error("Failed to fetch agents:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update an agent
app.put("/api/agents/:id", async (req, res) => {
  const { id } = req.params;
  const updateData = req.body; // { name, email, phone, dateHired, status, clients, properties, notes }

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid agent ID" });
  }

  try {
    const collection = db.collection("Agents");
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Agent not found" });
    }

    const updatedAgent = await collection.findOne({ _id: new ObjectId(id) });
    res.json(updatedAgent);
  } catch (err) {
    console.error("Failed to update agent:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete an agent
app.delete("/api/agents/:id", async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid agent ID" });
  }

  try {
    const collection = db.collection("Agents");
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Agent not found" });
    }

    res.json({ message: "Agent deleted successfully" });
  } catch (err) {
    console.error("Failed to delete agent:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add a new agent
app.post("/api/agents", async (req, res) => {
  const {
    name,
    email,
    phone,
    dateHired,
    status,
    notes,
    username,
    password,
    clients = [],
    properties = [],
    assignedClients = [],
    assignedProperties = [],
  } = req.body;

  if (!name || !email || !status) {
    return res.status(400).json({ error: "Name, email, and status are required" });
  }

  try {
    const collection = db.collection("Agents");

    // Check for duplicate email
    const existing = await collection.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: "Agent with this email already exists" });
    }

    const newAgent = {
      name,
      email: email.trim().toLowerCase(),
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

    // Return the created document
    const createdAgent = await collection.findOne({ _id: result.insertedId });
    res.status(201).json(createdAgent);
  } catch (err) {
    console.error("Failed to add agent:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/agents/:id", async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid agent ID" });

  try {
    const agent = await db.collection("Agents").findOne({ _id: new ObjectId(id) });
    if (!agent) return res.status(404).json({ error: "Agent not found" });
    res.json(agent);
  } catch (err) {
    console.error("Error fetching agent:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/client/:id", async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid client ID" });

  try {
    const client = await db.collection("Clients").findOne({ _id: new ObjectId(id) });
    if (!client) return res.status(404).json({ error: "Client not found" });
    res.json(client);
  } catch (err) {
    console.error("Error fetching client:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/property/:id", async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid property ID" });

  try {
    const property = await db.collection("Properties").findOne({ _id: new ObjectId(id) });
    if (!property) return res.status(404).json({ error: "Property not found" });
    res.json(property);
  } catch (err) {
    console.error("Error fetching property:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all clients
app.get("/api/clients", async (req, res) => {
  try {
    const clients = await db.collection("Clients").find({}).toArray();
    res.json(clients);
  } catch (err) {
    console.error("Failed to fetch clients:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get a single client by ID
app.get("/api/clients/:id", async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid client ID" });

  try {
    const client = await db.collection("Clients").findOne({ _id: new ObjectId(id) });
    if (!client) return res.status(404).json({ error: "Client not found" });
    res.json(client);
  } catch (err) {
    console.error("Error fetching client:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add a new client
app.post("/api/clients", async (req, res) => {
  const {
    fullName,
    email,
    phoneNumber,
    preferredContactMethod,
    preferredLanguage,
    budgetRange,
    locationEmirate,
    locationArea,
    purpose,
    timeSpan,
    preApprovalStatus,
    specificRequirements = [],
    tier,
    mailSent = false,
    assignedAgents = [],
    interestedProperties = []
  } = req.body;

  if (!fullName || !email) {
    return res.status(400).json({ error: "Full name and email are required" });
  }

  try {
    const collection = db.collection("Clients");

    const existing = await collection.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: "Client with this email already exists" });
    }

    const newClient = {
      date: (new Date()).toLocaleDateString('en-GB'),
      fullName,
      email: email.trim().toLowerCase(),
      phoneNumber: phoneNumber || "",
      preferredContactMethod: preferredContactMethod || "",
      preferredLanguage: preferredLanguage || "",
      budgetRange: budgetRange || "",
      locationEmirate: locationEmirate || "",
      locationArea: locationArea || "",
      purpose: purpose || "",
      timeSpan: timeSpan || "",
      preApprovalStatus: preApprovalStatus || "",
      specificRequirements,
      tier: tier || "Cold",
      mailSent,
      assignedAgents,
      interestedProperties
    };

    const result = await collection.insertOne(newClient);
    const createdClient = await collection.findOne({ _id: result.insertedId });
    res.status(201).json(createdClient);
  } catch (err) {
    console.error("Failed to add client:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update a client
app.put("/api/clients/:id", async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid client ID" });
  }

  try {
    const collection = db.collection("Clients");
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Client not found" });
    }

    const updatedClient = await collection.findOne({ _id: new ObjectId(id) });
    res.json(updatedClient);
  } catch (err) {
    console.error("Failed to update client:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
// Delete a client
app.delete("/api/clients/:id", async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid client ID" });
  }

  try {
    const collection = db.collection("Clients");
    const agentsCollection = db.collection("Agents");

    // 1. Delete the client by ObjectId
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Client not found" });
    }

    // 2. Remove client ID from all agents' "clients" arrays (string values)
    await agentsCollection.updateMany(
      {},
      {
        $pull: { clients: id }, // keep as string, not ObjectId
      }
    );

    res.json({ message: "Client deleted successfully and references removed" });
  } catch (err) {
    console.error("Failed to delete client:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// single property fetch (used by details modal)
app.get("/api/property/:id", async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid property ID" });
  try {
    const doc = await db.collection("Properties").findOne({ _id: new ObjectId(id) });
    if (!doc) return res.status(404).json({ error: "Property not found" });
    res.json(doc);
  } catch (err) {
    console.error("Error fetching property:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Get all properties
app.get("/api/properties", async (req, res) => {
  try {
    const { status, community, q, limit = 50, skip = 0 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (community) filter.community = community;
    if (q) filter.title = { $regex: q, $options: "i" };

    const items = await db.collection("Properties")
      .find(filter)
      .skip(Number(skip))
      .limit(Number(limit))
      .toArray();

    // ✅ Normalize: convert _id → id
    const normalized = items.map(({ _id, ...rest }) => ({
      id: _id.toString(),
      ...rest,
    }));

    res.json(normalized);
  } catch (err) {
    console.error("Failed to fetch properties:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Get a single property by ID
app.get("/api/properties/:id", async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid property ID" });

  try {
    const property = await db.collection("Properties").findOne({ _id: new ObjectId(id) });
    if (!property) return res.status(404).json({ error: "Property not found" });
    res.json(property);
  } catch (err) {
    console.error("Error fetching property:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add a property
app.post("/api/properties", async (req, res) => {
  const {
    title,
    community,
    subCommunity,
    price,
    status,
    assignedAgent,
    cover_photo,
    emirate,
    amenities = [],
    type
  } = req.body;

  if (!title || !community || !price || !status || !assignedAgent) {
    return res.status(400).json({ error: "Title, community, price, status, and assignedAgent are required" });
  }

  try {
    const newProperty = {
      title,
      community,
      subCommunity: subCommunity || "",
      price,
      status,
      assignedAgent, // keep as string, not ObjectId
      cover_photo: cover_photo || "",
      emirate: emirate || "",
      amenities,
      type: type || "",
      createdAt: new Date()
    };

    const collection = db.collection("Properties");
    const agentsCollection = db.collection("Agents");

    // Insert property into Properties collection
    const result = await collection.insertOne(newProperty);
    const createdProperty = await collection.findOne({ _id: result.insertedId });

    // ✅ Add property ID to assigned agent’s properties array (as string)
    await agentsCollection.updateOne(
      { _id: new ObjectId(assignedAgent) },
      { $addToSet: { properties: result.insertedId.toString() } }
    );

    res.status(201).json(createdProperty);
  } catch (err) {
    console.error("Failed to add property:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update a property
app.put("/api/properties/:id", async (req, res) => {
  const { id } = req.params;
  const updateData = { ...req.body };

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid property ID" });
  }

  try {
    const collection = db.collection("Properties");
    const agentsCollection = db.collection("Agents");

    // ✅ Convert assignedAgent to ObjectId if it's a valid string
    if (updateData.assignedAgent) {
      if (ObjectId.isValid(updateData.assignedAgent)) {
        updateData.assignedAgent = new ObjectId(updateData.assignedAgent);
      } else {
        updateData.assignedAgent = null;
      }
    }

    // Get existing property
    const existingProperty = await collection.findOne({ _id: new ObjectId(id) });
    if (!existingProperty) {
      return res.status(404).json({ error: "Property not found" });
    }

    const previousAgentId = existingProperty.assignedAgent?.toString();
    const newAgentId = updateData.assignedAgent ? updateData.assignedAgent.toString() : null;

    // Update the property
    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    // If the assigned agent has changed
    if (previousAgentId && previousAgentId !== newAgentId) {
      // Remove property ID from previous agent's properties array
      await agentsCollection.updateOne(
        { _id: new ObjectId(previousAgentId) },
        { $pull: { properties: new ObjectId(id) } }
      );

      // Add property ID to new agent's properties array
      if (newAgentId) {
        await agentsCollection.updateOne(
          { _id: new ObjectId(newAgentId) },
          { $addToSet: { properties: new ObjectId(id) } }
        );
      }
    }

    // Fetch and return the updated property
    const updatedProperty = await collection.findOne({ _id: new ObjectId(id) });
    res.json(updatedProperty);

  } catch (err) {
    console.error("Failed to update property:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a property
app.delete("/api/properties/:id", async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid property ID" });
  }

  try {
    const propertiesCollection = db.collection("Properties");
    const agentsCollection = db.collection("Agents");

    // 1. Delete the property document itself
    const result = await propertiesCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Property not found" });
    }

    // 2. Remove the property ID from all agents' "properties" arrays (stored as strings)
    await agentsCollection.updateMany(
      {},
      {
        $pull: { properties: id } // pull as string, not ObjectId
      }
    );

    res.json({ message: "Property deleted successfully and references removed from agents" });
  } catch (err) {
    console.error("Failed to delete property:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/search-leads", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "Missing 'url' in request body." });
  }

  if (!process.env.APIFY_API_TOKEN) {
    return res.status(500).json({ error: "Missing APIFY_API_TOKEN in .env" });
  }

  try {
    const client = new ApifyClient({
      token: process.env.APIFY_API_TOKEN,
    });

    console.log("🔗 Received Apollo search URL:", url);

    // Input for your Apify actor
    const input = {
      url,
      max_result: 25,
      include_email: true,
      contact_email_status_v2_verified: true,
      contact_email_exclude_catch_all: true,
    };

    // Run the actor (replace this ID with your own if different)
    const run = await client.actor("iJcISG5H8FJUSRoVA").call(input);

    // Fetch results
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    const leads = items.slice(0, 25);

    res.json({ success: true, count: leads.length, leads });
  } catch (error) {
    console.error("❌ Error fetching leads:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch leads.",
      details: error.message,
    });
  }
});

app.post("/api/campaigns", async (req, res) => {
  const { manager, campaignName, leads } = req.body;

  // --- Validation ---
  if (!manager || !manager.name || !manager.email || !campaignName || !Array.isArray(leads)) {
    return res.status(400).json({
      error: "Manager info, campaignName, and leads array are required.",
    });
  }

  try {
    const campaignsCollection = db.collection("Campaigns");

    const newCampaign = {
      manager: {
        name: manager.name,
        email: manager.email,
      },
      campaignName,
      leads: leads.map((lead) => ({
        id: lead.id || null,
        name: lead.name || null,
        email: lead.email || null,
        title: lead.title || null,
        organization: {
          name: lead.organization?.name || null,
          industry: lead.organization?.industry || null,
          website_url: lead.organization?.website_url || null,
        },
        location: {
          city: lead.location?.city || null,
          state: lead.location?.state || null,
          country: lead.location?.country || null,
        },
        linkedin_url: lead.linkedin_url || null,
        photo_url: lead.photo_url || null,
      })),
    };

    const result = await campaignsCollection.insertOne(newCampaign);
    const createdCampaign = await campaignsCollection.findOne({ _id: result.insertedId });

    res.status(201).json(createdCampaign);
  } catch (err) {
    console.error("❌ Failed to add campaign:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.get("/api/campaigns", async (req, res) => {
  try {
    const campaignsCollection = db.collection("Campaigns");

    const { name, email } = req.query;

    // --- Validation ---
    if (!name || !email) {
      return res.status(400).json({
        error: "Missing required query parameters: name and email.",
      });
    }

    // --- Filter by manager name & email ---
    const campaigns = await campaignsCollection
      .find({
        "manager.name": name,
        "manager.email": email,
      })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(campaigns);
  } catch (err) {
    console.error("❌ Failed to fetch campaigns:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/api/campaigns/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid campaign ID" });
    }

    const campaignsCollection = db.collection("Campaigns");
    const result = await campaignsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updatedData} }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    res.status(200).json({ success: true, message: "Campaign updated successfully" });
  } catch (err) {
    console.error("❌ Failed to update campaign:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// --- DELETE a campaign ---
app.delete("/api/campaigns/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid campaign ID" });
    }

    const campaignsCollection = db.collection("Campaigns");
    const result = await campaignsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    res.status(200).json({ success: true, message: "Campaign deleted successfully" });
  } catch (err) {
    console.error("❌ Failed to delete campaign:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/generate-property-emails", async (req, res) => {
  const { users, properties } = req.body;

  if (!Array.isArray(users) || users.length === 0)
    return res.status(400).json({ error: "Users array is required" });

  if (!Array.isArray(properties) || properties.length === 0)
    return res.status(400).json({ error: "Properties array is required" });

  try {
    // 1️⃣ Generate GPT descriptions for each property
    const descriptions = await Promise.all(
      properties.map(async (property) => {
        const prompt = `
          Write a short, 2–4 line marketing description for this property:
          Title: ${property.title}
          Community: ${property.community || ""}
          SubCommunity: ${property.subCommunity || ""}
          Price: ${property.price ? "AED " + property.price.toLocaleString() : "N/A"}
          Amenities: ${property.amenities?.length ? property.amenities.join(", ") : "N/A"}
          Highlight key features and make it appealing.
        `;

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
        });

        return completion.choices[0].message?.content || property.title;
      })
    );

    // 2️⃣ Get icebreakers for each user
    const usersWithIcebreakers = await Promise.all(
      users.map(async (user) => {
        if (!user.email || !user.linkedin_url)
          return { ...user, icebreaker: "" };

        try {
          const resp = await fetch("https://api.perplexity.ai/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "sonar-pro",
              messages: [
                {
                  role: "system",
                  content: `
                    You are a professional networking assistant. Your task is to write a single, concise, and friendly icebreaker message for a LinkedIn user. 
                    Do not include greetings like "Hello" or "Hi", and do not add any closings such as "Best regards" or similar phrases. 
                    Do not prefix the message with "Icebreaker:" or any other labels — output only the icebreaker sentence itself. 
                    The tone should be natural, authentic, and conversational.

                    You have live web access and can read the public LinkedIn profile provided. 
                    Use only factual details and insights derived from the given LinkedIn URL — do not invent or assume any information beyond what is available on that page.
                  `,
                },
                {
                  role: "user",
                  content: `Instructions:
                    - Review the LinkedIn profile at this URL: ${user.linkedin_url}
                    - Consider the user's recent roles, bio, and interests and generate an icebreaker.
                    - Keep the message short (1–2 sentences, 2–4 lines max).
                  `,
                },
              ],
            }),
          });

          const data = await resp.json();
          const icebreaker = data.choices?.[0]?.message?.content || "";
          return { ...user, icebreaker };
        } catch {
          return { ...user, icebreaker: "" };
        }
      })
    );

    // 3️⃣ Generate structured results per user
    const result = usersWithIcebreakers.map((user) => {
      // Generate same property list HTML
      const propertyList = descriptions
        .map(
          (desc, i) =>
            `<li><strong>${properties[i].title}</strong>: ${desc}</li>`
        )
        .join("");

      const htmlBody = `
        <p>Here are some properties we think you might like:</p>
        <ul>${propertyList}</ul>
        <p>Best regards,<br/>Real Estate Team</p>
      `;

      return {
        email: user.email,
        name: user.name,
        icebreaker: user.icebreaker,
        body: htmlBody, // optional: keep for reference
      };
    });

    // 4️⃣ Return structured JSON
    res.status(200).json({
      success: true,
      count: result.length,
      emails: result,
    });
  } catch (err) {
    console.error("Error generating property emails:", err);
    res.status(500).json({
      error: "Failed to generate email bodies",
      details: err.message,
    });
  }
});


app.post("/api/send-generated-emails", async (req, res) => {
  const { emails } = req.body;

  if (!Array.isArray(emails) || emails.length === 0)
    return res.status(400).json({ error: "Emails array required" });

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
    });

    const sendPromises = emails.map(async (user) => {
      const { email, name, icebreaker, body } = user;
      if (!email || !body) return null;

      // ✅ Build personalized HTML body
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <p>Hello ${name?.split(" ")[0] || "there"},</p>
          ${icebreaker ? `<p>${icebreaker}</p>` : ""}
          ${body}
        </div>
      `;

      const info = await transporter.sendMail({
        from: `"Real Estate App" <${process.env.USER}>`,
        to: process.env.USER, 
        subject: "Property Recommendations",
        html: htmlContent,
      });

      return { email, messageId: info.messageId };
    });

    const results = (await Promise.all(sendPromises)).filter(Boolean);

    res.status(200).json({ success: true, results });
  } catch (err) {
    console.error("❌ Error sending generated emails:", err);
    res
      .status(500)
      .json({ error: "Failed to send emails", details: err.message });
  }
});



app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
