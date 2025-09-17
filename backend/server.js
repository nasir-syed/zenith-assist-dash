const express = require("express");
const cors = require("cors");

let n8nData = [];
let clients = []; // list of connected SSE clients

const app = express();
app.use(cors({
  origin: true, // Allow all origins for testing
  credentials: true
}));
app.use(express.json());

// Add logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} from ${req.ip}`);
  next();
});

// n8n POSTs property data here
app.post("/properties", (req, res) => {
  n8nData = req.body;
  console.log(`${new Date().toISOString()} - Received from n8n:`, JSON.stringify(n8nData, null, 2));
  console.log(`Active clients: ${clients.length}`);

  // send to all SSE clients
  const message = JSON.stringify(n8nData);
  clients.forEach((client, index) => {
    try {
      client.res.write(`data: ${message}\n\n`);
      console.log(`Sent to client ${client.id} (index ${index})`);
    } catch (error) {
      console.error(`Error sending to client ${client.id}:`, error.message);
      // Remove failed client
      clients.splice(index, 1);
    }
  });

  res.json({ 
    success: true, 
    clientCount: clients.length,
    dataReceived: n8nData 
  });
});

// React GETs initial data here (optional)
app.get("/properties", (req, res) => {
  console.log(`${new Date().toISOString()} - Properties requested. Current data:`, JSON.stringify(n8nData, null, 2));
  res.json(n8nData);
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    clients: clients.length,
    hasData: n8nData ? Object.keys(n8nData).length > 0 : false,
    lastDataUpdate: n8nData.timestamp || "never"
  });
});

// SSE endpoint
app.get("/stream", (req, res) => {
  console.log(`${new Date().toISOString()} - New SSE client connecting from ${req.ip}`);
  
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Cache-Control");
  res.flushHeaders(); // send headers immediately

  const clientId = Date.now();
  const newClient = { id: clientId, res, connectedAt: new Date().toISOString() };
  clients.push(newClient);

  console.log(`Client ${clientId} connected. Total: ${clients.length}`);

  // Send initial data immediately if available
  if (n8nData && Object.keys(n8nData).length > 0) {
    try {
      const message = JSON.stringify(n8nData);
      res.write(`data: ${message}\n\n`);
      console.log(`Sent initial data to client ${clientId}`);
    } catch (error) {
      console.error(`Error sending initial data to client ${clientId}:`, error.message);
    }
  } else {
    // Send a ping to confirm connection
    res.write(`data: ${JSON.stringify({ type: "ping", timestamp: new Date().toISOString() })}\n\n`);
    console.log(`Sent ping to client ${clientId} (no initial data available)`);
  }

  // Send periodic heartbeat
  const heartbeat = setInterval(() => {
    try {
      res.write(`data: ${JSON.stringify({ type: "heartbeat", timestamp: new Date().toISOString() })}\n\n`);
    } catch (error) {
      console.log(`Client ${clientId} heartbeat failed, removing client`);
      clearInterval(heartbeat);
      clients = clients.filter((c) => c.id !== clientId);
    }
  }, 30000); // 30 seconds

  // Remove client on disconnect
  req.on("close", () => {
    clearInterval(heartbeat);
    clients = clients.filter((c) => c.id !== clientId);
    console.log(`Client ${clientId} disconnected. Total: ${clients.length}`);
  });

  req.on("error", (error) => {
    console.error(`Client ${clientId} error:`, error.message);
    clearInterval(heartbeat);
    clients = clients.filter((c) => c.id !== clientId);
  });
});

// Debug endpoint to see active clients
app.get("/debug/clients", (req, res) => {
  res.json({
    totalClients: clients.length,
    clients: clients.map(c => ({
      id: c.id,
      connectedAt: c.connectedAt,
      connected: !c.res.destroyed
    }))
  });
});

// Keep-alive for Render
setInterval(() => {
  console.log(`${new Date().toISOString()} - Keep-alive: ${clients.length} clients connected`);
}, 300000); // 5 minutes

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`SSE endpoint: http://localhost:${PORT}/stream`);
});