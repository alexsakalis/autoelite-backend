const db = require("../models/db");

// GET all photos for a given invoice
exports.getPhotosByInvoice = async (req, res) => {
  const { invoice_id } = req.params;
  try {
    const result = await db.query(
      "SELECT * FROM invoice_photos WHERE invoice_id = $1 ORDER BY uploaded_at DESC",
      [invoice_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST upload a new photo URL for an invoice
exports.uploadPhoto = async (req, res) => {
  const { invoice_id } = req.params;
  const { photo_url } = req.body;

  if (!photo_url) {
    return res.status(400).json({ error: "Missing photo_url" });
  }

  try {
    const result = await db.query(
      `INSERT INTO invoice_photos (invoice_id, photo_url)
       VALUES ($1, $2)
       RETURNING *`,
      [invoice_id, photo_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE a photo by ID
exports.deletePhoto = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM invoice_photos WHERE id = $1", [id]);
    res.json({ message: "Photo deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};