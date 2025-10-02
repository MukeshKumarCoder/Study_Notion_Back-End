const express = require("express");
const router = express.Router();
const { getPurchaseHistory } = require("../controllers/purchaseController");
const { auth } = require("../middlewares/auth");

router.get("/history", auth, getPurchaseHistory);

module.exports = router;
