const express = require("express");
const cors = require("cors");

let n8nData = [];
let clients = []; // list of connected SSE clients

const app = express();
app.use(cors()); // still useful for /properties etc.
app.use(express.json());

// n8n POSTs property data here
app.post("/properties", (req, res) => {
  n8nData = req.body;
  console.log("Received from n8n:", n8nData);

  // send to all SSE clients
  clients.forEach((client) => {
    client.res.write(`data: ${JSON.stringify(n8nData)}\n\n`);
  });

  res.json({ success: true });
});

// React GETs initial data here (optional)
app.get("/properties", (req, res) => {
  res.json(n8nData);
});

// SSE endpoint
app.get("/stream", (req, res) => {
  // 🔑 Set CORS headers explicitly for SSE
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:8080");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.flushHeaders(); // send headers immediately

  const clientId = Date.now();
  const newClient = { id: clientId, res };
  clients.push(newClient);

  console.log(`Client ${clientId} connected. Total: ${clients.length}`);

  // Send initial data immediately
  if (n8nData && Object.keys(n8nData).length > 0) {
    res.write(`data: ${JSON.stringify(n8nData)}\n\n`);
  }

  // Remove client on disconnect
  req.on("close", () => {
    clients = clients.filter((c) => c.id !== clientId);
    console.log(`Client ${clientId} disconnected. Total: ${clients.length}`);
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
