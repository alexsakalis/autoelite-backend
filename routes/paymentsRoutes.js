const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

router.get("/:invoice_id", paymentController.getPaymentsByInvoice);
router.post("/", paymentController.createPayment);

module.exports = router;