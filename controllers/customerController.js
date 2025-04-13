const db = require("../models/db");

exports.getAllCustomers = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM customers ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCustomerById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("SELECT * FROM customers WHERE id = $1", [id]);
    result.rows.length
      ? res.json(result.rows[0])
      : res.status(404).json({ error: "Customer not found" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createCustomer = async (req, res) => {
  const {
    full_name,
    email,
    phone,
    street_address,
    city,
    province,
    postal_code,
    is_fleet,
    fleet_account_id
  } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO customers 
        (full_name, email, phone, street_address, city, province, postal_code, is_fleet, fleet_account_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [full_name, email, phone, street_address, city, province, postal_code, is_fleet, fleet_account_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCustomer = async (req, res) => {
  const { id } = req.params;
  const {
    full_name,
    email,
    phone,
    street_address,
    city,
    province,
    postal_code,
    is_fleet,
    fleet_account_id
  } = req.body;

  try {
    const result = await db.query(
      `UPDATE customers SET 
        full_name = $1,
        email = $2,
        phone = $3,
        street_address = $4,
        city = $5,
        province = $6,
        postal_code = $7,
        is_fleet = $8,
        fleet_account_id = $9,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *`,
      [full_name, email, phone, street_address, city, province, postal_code, is_fleet, fleet_account_id, id]
    );

    result.rows.length
      ? res.json(result.rows[0])
      : res.status(404).json({ error: "Customer not found" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteCustomer = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM customers WHERE id = $1", [id]);
    res.json({ message: "Customer deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};