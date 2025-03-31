const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");

const {
  createAppointment,
  getAppointments,
} = require("../controllers/appointmentController");

router.post("/", createAppointment);
router.get("/", getAppointments);

// POST /api/appointments/upload-photo → Upload one photo
router.post("/upload-photo", upload.single("photo"), (req, res) => {
  res.json({
    message: "Photo uploaded successfully",
    filename: req.file.filename,
    fileUrl: `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`,
  });
});

module.exports = router;