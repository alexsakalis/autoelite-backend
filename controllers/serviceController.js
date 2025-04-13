const db = require("../models/db");

// GET all services linked to an invoice
exports.getServicesByInvoice = async (req, res) => {
  const { invoice_id } = req.params;
  try {
    const result = await db.query(
      "SELECT * FROM services WHERE invoice_id = $1 ORDER BY id ASC",
      [invoice_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST a new service for an invoice
exports.createService = async (req, res) => {
  const { invoice_id, description, price } = req.body;

  if (!invoice_id || !description || price === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await db.query(
      `INSERT INTO services (invoice_id, description, price)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [invoice_id, description, price]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE a service by ID
exports.deleteService = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM services WHERE id = $1", [id]);
    res.json({ message: "Service deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};