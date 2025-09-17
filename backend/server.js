const express = require("express");
const cors = require("cors");

let n8nData = [];
let clients = [];

const app = express();

// Regular CORS for API routes
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} from ${req.ip}`);
  next();
});

// POST route from n8n
app.post("/properties", (req, res) => {
  try {
    n8nData = req.body;
    console.log("Received from n8n:", n8nData);

    const deadClients = [];
    clients.forEach((client, index) => {
      try {
        client.res.write(`data: ${JSON.stringify(n8nData)}\n\n`);
      } catch (error) {
        console.log(`Error sending to client ${client.id}:`, error.message);
        deadClients.push(index);
      }
    });

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

// GET latest data
app.get("/properties", (req, res) => {
  res.json(n8nData);
});

// Allow preflight for SSE
app.options("/stream", cors());

// SSE connection route
app.get("/stream", (req, res) => {
  // ✅ Strict SSE headers (no buffering, CORS-friendly)
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*"); // safest for SSE
  res.setHeader("X-Accel-Buffering", "no");

  res.flushHeaders();

  const clientId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';

  const newClient = {
    id: clientId,
    res,
    connectedAt: new Date(),
    ip: clientIP,
  };

  clients.push(newClient);
  console.log(`Client ${clientId} (${clientIP}) connected. Total: ${clients.length}`);

  // Send connection confirmation
  try {
    res.write(`event: connection\n`);
    res.write(`data: ${JSON.stringify({
      type: 'connection',
      message: 'Connected successfully',
      clientId,
      timestamp: new Date().toISOString()
    })}\n\n`);

    if (n8nData && Object.keys(n8nData).length > 0) {
      res.write(`data: ${JSON.stringify(n8nData)}\n\n`);
    }
  } catch (error) {
    console.log(`Error sending initial data to client ${clientId}:`, error.message);
  }

  // ✅ Keep-alive heartbeats
  const heartbeatInterval = setInterval(() => {
    try {
      res.write(`event: heartbeat\n`);
      res.write(`data: ${JSON.stringify({
        type: 'heartbeat',
        timestamp: new Date().toISOString()
      })}\n\n`);
    } catch (error) {
      console.log(`Heartbeat failed for client ${clientId}:`, error.message);
      clearInterval(heartbeatInterval);
    }
  }, 30000);

  // Cleanup on disconnect
  const cleanup = () => {
    clearInterval(heartbeatInterval);
    clients = clients.filter(c => c.id !== clientId);
    console.log(`Client ${clientId} disconnected. Total: ${clients.length}`);
  };

  req.on("close", cleanup);
  req.on("error", (error) => {
    console.log(`Client ${clientId} error:`, error.message);
    cleanup();
  });

  res.on("error", (error) => {
    console.log(`Response error for client ${clientId}:`, error.message);
    cleanup();
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    clients: clients.length,
    uptime: process.uptime(),
    hasData: Object.keys(n8nData).length > 0
  });
});

// SSE status check
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

// Error handler
app.use((error, req, res, next) => {
  console.error("Express error:", error);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: error.message
  });
});

// Handle process-level errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
  console.log(`🩺 Health:  http://0.0.0.0:${PORT}/health`);
  console.log(`📡 SSE:     http://0.0.0.0:${PORT}/stream`);
  console.log(`📊 Status:  http://0.0.0.0:${PORT}/status`);
});
