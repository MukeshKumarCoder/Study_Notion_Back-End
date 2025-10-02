const router = require("express").Router();

const { capturePayment, verifySignature } = require("../controllers/Payments");

const { auth, isStudent } = require("../middlewares/auth");

router.post("/create-order", auth, isStudent, capturePayment);
router.post("/verify-payment", verifySignature);

module.exports = router;
