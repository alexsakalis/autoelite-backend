const db = require("../models/db");

const createInvoice = async (req, res) => {
  const { appointment_id, total_amount, notes } = req.body;

  const invoice_number = `INV-${Date.now()}`;

  try {
    const result = await db.query(
      `INSERT INTO invoices 
        (appointment_id, invoice_number, total_amount, notes) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [appointment_id, invoice_number, total_amount, notes]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create Invoice Error:", err.message);
    res.status(500).json({ error: "Failed to create invoice" });
  }
};

const getInvoices = async (req, res) => {
    try {
      const invoices = await db.query("SELECT * FROM invoices ORDER BY created_at DESC");
  
      const fullInvoices = await Promise.all(
        invoices.rows.map(async (inv) => {
          const photos = await db.query(
            "SELECT * FROM invoice_photos WHERE invoice_id = $1",
            [inv.id]
          );
          return { ...inv, photos: photos.rows };
        })
      );
  
      res.status(200).json(fullInvoices);
    } catch (err) {
      console.error("Get Invoices Error:", err.message);
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  };

module.exports = {
  createInvoice,
  getInvoices,
};