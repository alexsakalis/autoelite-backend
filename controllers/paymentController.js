const db = require("../models/db");

// GET all payments for a given invoice
exports.getPaymentsByInvoice = async (req, res) => {
  const { invoice_id } = req.params;
  try {
    const result = await db.query(
      "SELECT * FROM payments WHERE invoice_id = $1 ORDER BY payment_date DESC",
      [invoice_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST a new payment record
exports.createPayment = async (req, res) => {
  const { invoice_id, amount_paid, payment_method } = req.body;

  if (!invoice_id || !amount_paid || !payment_method) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await db.query(
      `INSERT INTO payments (invoice_id, amount_paid, payment_method)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [invoice_id, amount_paid, payment_method]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};