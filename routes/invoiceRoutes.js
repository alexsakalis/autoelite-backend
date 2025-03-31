const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const sendEmail = require("../utils/sendEmail");
const generateInvoicePDF = require("../utils/generateInvoicePDF");
const db = require("../models/db");
const fs = require("fs");

const {
  createInvoice,
  getInvoices,
} = require("../controllers/invoiceController");

// Create a new invoice
router.post("/", createInvoice);

// Get all invoices (with photos)
router.get("/", getInvoices);

// Upload a photo for an invoice
router.post("/upload-photo/:invoice_id", upload.single("photo"), async (req, res) => {
  const { invoice_id } = req.params;

  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const photo_url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

  try {
    const result = await db.query(
      "INSERT INTO invoice_photos (invoice_id, photo_url) VALUES ($1, $2) RETURNING *",
      [invoice_id, photo_url]
    );

    res.status(201).json({
      message: "Photo uploaded and linked to invoice",
      photo: result.rows[0],
    });
  } catch (err) {
    console.error("Photo upload error:", err.message);
    res.status(500).json({ error: "Failed to upload photo" });
  }
});

// Update invoice status (e.g., to 'paid')
router.patch("/status/:invoice_id", async (req, res) => {
  const { invoice_id } = req.params;
  const { status } = req.body;

  if (!status) return res.status(400).json({ error: "Missing status" });

  try {
    const result = await db.query(
      "UPDATE invoices SET status = $1 WHERE id = $2 RETURNING *",
      [status, invoice_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    res.json({
      message: `Invoice #${result.rows[0].invoice_number} updated to '${status}'`,
      invoice: result.rows[0],
    });
  } catch (err) {
    console.error("Update Invoice Status Error:", err.message);
    res.status(500).json({ error: "Failed to update invoice status" });
  }
});

// Send PDF invoice via email
router.post("/send/:invoice_id", async (req, res) => {
  const { invoice_id } = req.params;

  try {
    const invoice = await db.query("SELECT * FROM invoices WHERE id = $1", [invoice_id]);
    if (invoice.rows.length === 0) return res.status(404).json({ error: "Invoice not found" });
    const inv = invoice.rows[0];

    const appointment = await db.query("SELECT * FROM appointments WHERE id = $1", [inv.appointment_id]);
    if (appointment.rows.length === 0) return res.status(404).json({ error: "Related appointment not found" });
    const appt = appointment.rows[0];

    if (!appt.customer_email) return res.status(400).json({ error: "Customer email not found" });

    const photos = await db.query("SELECT * FROM invoice_photos WHERE invoice_id = $1", [invoice_id]);

    const amount = parseFloat(inv.total_amount || 0).toFixed(2);
    const photoHtml = photos.rows.map(
      (p) => `<img src="${p.photo_url}" style="width:150px; margin:5px 0;" />`
    ).join("");

    const html = `
  <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="http://localhost:5000/uploads/logo.png" alt="Autoelite Logo" style="height: 80px;" />
      <h1 style="margin: 10px 0 0;">Autoelite</h1>
      <p>123 Main Street, YourCity, QC H0H 0H0</p>
      <p>(123) 456-7890 | info@autoelite.ca</p>
      <hr style="margin: 20px 0;" />
    </div>

    <h2>Invoice #${inv.invoice_number}</h2>
    <p><strong>Customer:</strong> ${appt.customer_name}</p>
    <p><strong>Car:</strong> ${appt.car_model}</p>
    <p><strong>Date:</strong> ${new Date(appt.appointment_time).toLocaleString()}</p>
    <p><strong>Service:</strong> ${appt.service_type}</p>
    <p><strong>Total:</strong> $${amount}</p>
    <p><strong>Status:</strong> ${inv.status}</p>
    ${inv.notes ? `<p><strong>Notes:</strong> ${inv.notes}</p>` : ""}

    ${photos.rows.length > 0 ? `
      <h4 style="margin-top: 30px;">Attached Photos:</h4>
      ${photoHtml}
    ` : ""}

    <p style="margin-top: 40px;">Thank you for choosing Autoelite!</p>
  </div>
`;

    const pdfPath = await generateInvoicePDF(html, inv.invoice_number);

    const transporter = require("nodemailer").createTransport({
      host: "smtp.office365.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Autoelite" <${process.env.EMAIL_USER}>`,
      to: appt.customer_email,
      subject: `Invoice ${inv.invoice_number} from Autoelite`,
      text: `Hi ${appt.customer_name},\n\nPlease find your invoice attached for your recent service.`,
      attachments: [
        {
          filename: `invoice-${inv.invoice_number}.pdf`,
          path: pdfPath,
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    // Clean up temporary file
    fs.unlinkSync(pdfPath);

    res.json({ message: "Invoice email (PDF) sent to customer!" });
  } catch (err) {
    console.error("Send Invoice (PDF) Error:", err);
    res.status(500).json({ error: "Failed to send invoice PDF" });
  }
});

module.exports = router;