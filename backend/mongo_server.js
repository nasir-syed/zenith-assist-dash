const express = require("express");
const { MongoClient,  ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const cors = require("cors");
// const bcrypt = require("bcrypt"); // optional for hashed passwords

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors()); 


const MONGO_URI = "mongodb+srv://syednasiruddin:ilovemegaknight@realestate.brkiq5c.mongodb.net/?retryWrites=true&w=majority&appName=RealEstate";
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


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
