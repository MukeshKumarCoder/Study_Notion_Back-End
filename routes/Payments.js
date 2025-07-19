const router = require("express").Router();

const { capturePayment, verifySignature } = require("../controllers/Payments");

const { auth, isStudent } = require("../middlewares/auth");

router.post("/capture-payment", auth, isStudent, capturePayment);
router.post("/verify-signature", verifySignature);

module.exports = router;
