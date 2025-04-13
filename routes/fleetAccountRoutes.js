const express = require("express");
const router = express.Router();
const fleetController = require("../controllers/fleetController");

router.get("/", fleetController.getAllFleets);
router.get("/:id", fleetController.getFleetById);
router.post("/", fleetController.createFleet);
router.patch("/:id", fleetController.updateFleet);
router.delete("/:id", fleetController.deleteFleet);

module.exports = router;