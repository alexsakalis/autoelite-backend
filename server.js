require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./models/db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
const appointmentRoutes = require("./routes/appointmentRoutes.js");
app.use("/api/appointments", appointmentRoutes);

const invoiceRoutes = require("./routes/invoiceRoutes");
app.use("/api/invoices", invoiceRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("Autoelite backend is running.");
});

// DB Test route (optional)
app.get("/api/test-db", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()");
    res.status(200).json({ connected: true, time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ connected: false, error: err.message });
  }
});

// Start server & test DB on startup
const PORT = process.env.PORT || 8080;
app.listen(PORT, async () => {
    console.log(`✅ Server running on port ${PORT}`);
  
    try {
      const result = await db.query("SELECT NOW()");
      console.log("✅ PostgreSQL connected:", result.rows[0]);
    } catch (err) {
      console.error("❌ PostgreSQL connection error on startup:");
      console.error(err); // full error object, not just err.message
    }
  });