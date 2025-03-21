const router = require("express").Router();
const { capturePayment, verifySignature } = require("../controllers/Payments");
const { auth, isStudent } = require("../middlewares/auth");

router.post("/capturepayment", auth, isStudent, capturePayment);
router.post("/verifysignature", verifySignature);

module.exports = router;
