require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
const appointmentRoutes = require("./routes/appointmentRoutes.js");
app.use("/api/appointments", appointmentRoutes);

const invoiceRoutes = require("./routes/invoiceRoutes");
app.use("/api/invoices", invoiceRoutes);

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));