const db = require("../models/db");
const sendEmail = require("../utils/sendEmail");

const createAppointment = async (req, res) => {
  const {
    customer_name,
    customer_email,
    customer_number,
    car_model,
    appointment_time,
    status = "scheduled",
    service_type,
    notes,
  } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO appointments 
        (customer_name, customer_email, customer_number, car_model, appointment_time, status, service_type, notes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [
        customer_name,
        customer_email,
        customer_number,
        car_model,
        appointment_time,
        status,
        service_type,
        notes,
      ]
    );

    const appointment = result.rows[0];

    if (customer_email) {
      await sendEmail(
        customer_email,
        "Your Appointment is Confirmed",
        `Hi ${customer_name}, your appointment for your ${car_model} is scheduled for ${appointment_time}.`,
        `
          <h2>Appointment Confirmation</h2>
          <p>Hi ${customer_name},</p>
          <p>Your appointment for your <strong>${car_model}</strong> is confirmed for:</p>
          <p><strong>${new Date(appointment_time).toLocaleString()}</strong></p>
          <p>We look forward to seeing you!</p>
          <br />
          <p>— Autoelite</p>
        `
      );
    }

    res.status(201).json(appointment);
  } catch (err) {
    console.error("Create Appointment Error:", err.message);
    res.status(500).json({ error: "Failed to create appointment" });
  }
};

const getAppointments = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM appointments ORDER BY appointment_time ASC"
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Get Appointments Error:", err.message);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
};

module.exports = {
  createAppointment,
  getAppointments,
};