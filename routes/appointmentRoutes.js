const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");

const {
  createAppointment,
  getAppointments,
} = require("../controllers/appointmentController");

router.post("/", createAppointment);
router.get("/", getAppointments);

router.post("/upload-photo", upload.single("photo"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No photo file uploaded." });
  }

  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

  res.status(200).json({
    message: "Photo uploaded successfully",
    filename: req.file.filename,
    fileUrl,
  });
});

module.exports = router;