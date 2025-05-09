const express = require("express");
const router = express.Router();
const vehicleController = require("../controllers/vehicleController");

router.get("/", vehicleController.getAllVehicles);
router.get("/:id", vehicleController.getVehicleById);
router.post("/", vehicleController.createVehicle);
router.patch("/:id", vehicleController.updateVehicle);
router.delete("/:id", vehicleController.deleteVehicle);

module.exports = router;