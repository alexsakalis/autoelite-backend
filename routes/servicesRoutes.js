const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/serviceController");

router.get("/:invoice_id", serviceController.getServicesByInvoice);
router.post("/", serviceController.createService);
router.delete("/:id", serviceController.deleteService);

module.exports = router;