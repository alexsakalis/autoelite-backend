const db = require("../models/db");
const bcrypt = require("bcrypt");

// GET all users (internal use only)
exports.getAllUsers = async (req, res) => {
  try {
    const result = await db.query("SELECT id, name, email, role FROM users ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST create a new user (register)
exports.createUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role`,
      [name, email, hashedPassword, role || "staff"]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      res.status(409).json({ error: "Email already registered" });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};

// POST login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    // Optionally, generate a JWT here instead of returning user directly
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH update user info
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;

  try {
    const result = await db.query(
      `UPDATE users SET
        name = $1,
        email = $2,
        role = $3,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, name, email, role`,
      [name, email, role, id]
    );

    result.rows.length
      ? res.json(result.rows[0])
      : res.status(404).json({ error: "User not found" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE user
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM users WHERE id = $1", [id]);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};