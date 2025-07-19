const router = require("express").Router();
const {
  login,
  signUp,
  sendOTP,
  changePassword,
} = require("../controllers/Auth");

const {
  resetPassword,
  resetPasswordToken,
} = require("../controllers/ResetPassword");

const { auth } = require("../middlewares/auth");

// Auth Routes
router.post("/login", login);
router.post("/signup", signUp);
router.post("/send-otp", sendOTP);

// Change password (Authenticated)
router.post("/change-password", auth, changePassword);

// Route for generating a reset password token
router.post("/reset-password-token", resetPasswordToken);

// Route for resetting user's password after verification
router.post("/reset-password", resetPassword);

module.exports = router;
