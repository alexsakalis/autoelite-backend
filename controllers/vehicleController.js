const db = require("../models/db");

exports.getAllVehicles = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM vehicles ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getVehicleById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("SELECT * FROM vehicles WHERE id = $1", [id]);
    result.rows.length
      ? res.json(result.rows[0])
      : res.status(404).json({ error: "Vehicle not found" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createVehicle = async (req, res) => {
  const {
    customer_id,
    vin,
    plate,
    make,
    model,
    year,
    notes
  } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO vehicles 
        (customer_id, vin, plate, make, model, year, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [customer_id, vin, plate, make, model, year, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateVehicle = async (req, res) => {
  const { id } = req.params;
  const {
    customer_id,
    vin,
    plate,
    make,
    model,
    year,
    notes
  } = req.body;

  try {
    const result = await db.query(
      `UPDATE vehicles SET 
        customer_id = $1,
        vin = $2,
        plate = $3,
        make = $4,
        model = $5,
        year = $6,
        notes = $7,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [customer_id, vin, plate, make, model, year, notes, id]
    );

    result.rows.length
      ? res.json(result.rows[0])
      : res.status(404).json({ error: "Vehicle not found" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteVehicle = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM vehicles WHERE id = $1", [id]);
    res.json({ message: "Vehicle deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}