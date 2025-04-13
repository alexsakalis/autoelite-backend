const db = require("../models/db");

// GET all fleet accounts
exports.getAllFleets = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM fleet_accounts ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET a single fleet account by ID
exports.getFleetById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      "SELECT * FROM fleet_accounts WHERE id = $1",
      [id]
    );
    result.rows.length
      ? res.json(result.rows[0])
      : res.status(404).json({ error: "Fleet account not found" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST create new fleet account
exports.createFleet = async (req, res) => {
  const {
    company_name,
    contact_person,
    email,
    phone,
    billing_cycle,
    notes
  } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO fleet_accounts 
        (company_name, contact_person, email, phone, billing_cycle, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [company_name, contact_person, email, phone, billing_cycle, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH update a fleet account
exports.updateFleet = async (req, res) => {
  const { id } = req.params;
  const {
    company_name,
    contact_person,
    email,
    phone,
    billing_cycle,
    notes
  } = req.body;

  try {
    const result = await db.query(
      `UPDATE fleet_accounts SET 
        company_name = $1,
        contact_person = $2,
        email = $3,
        phone = $4,
        billing_cycle = $5,
        notes = $6,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [company_name, contact_person, email, phone, billing_cycle, notes, id]
    );

    result.rows.length
      ? res.json(result.rows[0])
      : res.status(404).json({ error: "Fleet account not found" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE a fleet account
exports.deleteFleet = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM fleet_accounts WHERE id = $1", [id]);
    res.json({ message: "Fleet account deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};