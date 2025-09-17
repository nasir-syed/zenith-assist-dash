const express = require("express");
const cors = require("cors");

let n8nData = [];
let clients = []; // List of connected SSE clients

const app = express();

// Enhanced CORS configuration to allow connections from any origin
app.use(cors({
  origin: true, // Allow any origin
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Connection']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} from ${req.ip}`);
  next();
});

// n8n POSTs property data here
app.post("/properties", (req, res) => {
  try {
    n8nData = req.body;
    console.log("Received from n8n:", n8nData);

    // Send to all SSE clients with error handling
    const deadClients = [];
    clients.forEach((client, index) => {
      try {
        client.res.write(`data: ${JSON.stringify(n8nData)}\n\n`);
      } catch (error) {
        console.log(`Error sending to client ${client.id}:`, error.message);
        deadClients.push(index);
      }
    });

    // Remove dead clients
    deadClients.reverse().forEach(index => {
      const removedClient = clients.splice(index, 1)[0];
      console.log(`Removed dead client ${removedClient.id}`);
    });

    res.json({ success: true, clientsNotified: clients.length });
  } catch (error) {
    console.error("Error in /properties POST:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// React GETs initial data here (optional)
app.get("/properties", (req, res) => {
  res.json(n8nData);
});

// Enhanced SSE endpoint with better error handling and CORS
app.get("/stream", (req, res) => {
  // Set comprehensive SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Cache-Control, Connection");
  
  // Prevent timeout
  res.setHeader("X-Accel-Buffering", "no"); // For nginx
  
  res.flushHeaders(); // Send headers immediately

  const clientId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  
  const newClient = { 
    id: clientId, 
    res, 
    connectedAt: new Date(),
    ip: clientIP
  };
  
  clients.push(newClient);
  console.log(`Client ${clientId} (${clientIP}) connected. Total: ${clients.length}`);

  // Send immediate connection confirmation
  try {
    res.write(`data: ${JSON.stringify({ 
      type: 'connection', 
      message: 'Connected successfully',
      clientId: clientId,
      timestamp: new Date().toISOString()
    })}\n\n`);

    // Send initial data if available
    if (n8nData && Object.keys(n8nData).length > 0) {
      res.write(`data: ${JSON.stringify(n8nData)}\n\n`);
    }
  } catch (error) {
    console.log(`Error sending initial data to client ${clientId}:`, error.message);
  }

  // Send periodic heartbeat to keep connection alive
  const heartbeatInterval = setInterval(() => {
    try {
      res.write(`data: ${JSON.stringify({ 
        type: 'heartbeat', 
        timestamp: new Date().toISOString() 
      })}\n\n`);
    } catch (error) {
      console.log(`Heartbeat failed for client ${clientId}:`, error.message);
      clearInterval(heartbeatInterval);
      // Client will be removed in the close handler
    }
  }, 30000); // Send heartbeat every 30 seconds

  // Handle client disconnect
  const cleanup = () => {
    clearInterval(heartbeatInterval);
    clients = clients.filter((c) => c.id !== clientId);
    console.log(`Client ${clientId} disconnected. Total: ${clients.length}`);
  };

  req.on("close", cleanup);
  req.on("error", (error) => {
    console.log(`Client ${clientId} error:`, error.message);
    cleanup();
  });

  // Handle response errors
  res.on("error", (error) => {
    console.log(`Response error for client ${clientId}:`, error.message);
    cleanup();
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "healthy",
    clients: clients.length,
    uptime: process.uptime(),
    hasData: Object.keys(n8nData).length > 0
  });
});

// Status endpoint to show connected clients
app.get("/status", (req, res) => {
  res.json({
    connectedClients: clients.length,
    clients: clients.map(c => ({
      id: c.id,
      ip: c.ip,
      connectedAt: c.connectedAt,
      connectedFor: Math.floor((Date.now() - c.connectedAt.getTime()) / 1000) + 's'
    })),
    dataAvailable: Object.keys(n8nData).length > 0,
    lastData: n8nData
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Express error:", error);
  res.status(500).json({ 
    success: false, 
    error: "Internal server error",
    message: error.message 
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit, just log the error
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit, just log the error
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`Status check: http://0.0.0.0:${PORT}/status`);
  console.log(`SSE endpoint: http://0.0.0.0:${PORT}/stream`);
});