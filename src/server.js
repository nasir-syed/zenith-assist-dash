import express from "express";
import cors from "cors";

let n8nData = []; // in-memory cache

const app = express();
app.use(cors());
app.use(express.json());

// n8n will POST here
app.post("/properties", (req, res) => {
  n8nData = req.body;
  console.log("Received from n8n:", n8nData);
  res.json({ success: true });
});

// React will GET here
app.get("/properties", (req, res) => {
  res.json(n8nData);
});

app.listen(4000, () => console.log("Server running on http://localhost:4000"));
