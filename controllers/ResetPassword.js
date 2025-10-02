const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

//reset Password Token
exports.resetPasswordToken = async (req, res) => {
  try {
    const email = req.body.email;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    //check user for this email , email validation
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `No user found with email: ${email}`,
      });
    }

    //generate token
    const token = crypto.randomBytes(30).toString("hex");

    user.token = token;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/update-password/${token}`;

    await mailSender(
      email,
      "Password Reset Link",
      `Click the following link to reset your password: ${resetUrl}`
    );

    return res.status(200).json({
      success: true,
      message: "Reset link sent to your email",
    });
  } catch (error) {
    console.error("Error sending reset token:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send reset password link",
    });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword, token } = req.body;

    if (!password || !confirmPassword || !token) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    //get user details from db using token
    const user = await User.findOne({ token });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    if (user.resetPasswordExpires < Date.now()) {
      return res.status(403).json({
        success: false,
        message: "Token has expired",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    //password update
    user.password = hashedPassword;
    user.token = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset Successful",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reset password",
    });
  }
};
