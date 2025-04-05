const User = require("../models/User");
const mailSender = require("../utilis/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

//reset Password Token
exports.resetPasswordToken = async (req, res) => {
  try {
    //get email from req body
    const email = req.body.email;
    //check user for this email , email validation
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: `This Email: ${email} is not Registered With Us Enter a Valid Email `,
      });
    }
    //generate token
    const token = crypto.randomBytes(20).toString("hex");
    //update user by adding token and expiration time
    const updatedDetails = await User.findOneAndUpdate(
      { email: email },
      {
        token: token,
        resetPasswordExpires: Date.now() + 3600000,
      },
      { new: true }
    );
    // console.log("DETAILS", updatedDetails);
    //create url
    const url = `http://localhost:3000/update-password/${token}`;
    //send mail containing the url
    await mailSender(
      email,
      "Password Reset Link",
      `Your Link for email verification is ${url}. Please click this url to reset your password.`
    );
    //return response
    return res.status(200).json({
      success: true,
      url: url,
      message:
        "Email sent successfully, Please check email and Reset Your Password",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went Wrong while sending Reset Password Mail...",
    });
  }
};

//resetPassword\

exports.resetPassword = async (req, res) => {
  try {
    // data fetch
    const { password, confirmPassword, token } = req.body;
    //validation
    if (password !== confirmPassword) {
      return res.json({
        success: false,
        message: "Password and Confirm Password Does not Match",
      });
    }
    //get userdetails from db using token
    const userDetails = await User.findOne({ token: token });
    //if no entry - invalid token
    if (!userDetails) {
      return res.json({
        success: false,
        message: "Token is invalid",
      });
    }
    //token time check
    if (!(userDetails.resetPasswordExpires > Date.now())) {
      return res.status(403).json({
        success: false,
        message: "Token is expired, please regenerate your token",
      });
    }
    //hash pwd
    const encryptedPassword = await bcrypt.hash(password, 10);
    //password update
    await User.findOneAndUpdate(
      { token: token },
      { password: encryptedPassword },
      { new: true }
    );
    //return response
    return res.status(200).json({
      success: true,
      message: "Password reset Successful",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while sending the Reset Password mail",
    });
  }
};
