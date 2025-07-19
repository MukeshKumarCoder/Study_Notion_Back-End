const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
const { sendOTP } = require("../mail/templates/emailVerificationTemplate");
const profile = require("../models/Profile");
require("dotenv").config();

// SignUp

exports.signUp = async (req, res) => {
  try {
    //data from body
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;
    //validate
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }
    // password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and Confirm Password does not matched",
      });
    }
    // check user already exist or not
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User is already registered",
      });
    }
    // find the recent otp
    const recentOtp = await OTP.find({ email })
      .sort({ createdAt: -1 })
      .limit(1);
    // console.log(recentOtp);
    // validate otp
    if (recentOtp.length == 0) {
      return res.status(400).json({
        success: false,
        message: "Otp Not Found",
      });
    } else if (otp !== recentOtp[0].otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid Otp",
      });
    }
    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    //Create the user
    // let approved = "";
    // approved === "Instructor" ? (approved = false) : (approved = true);
    let approved = accountType === "Instructor" ? false : true;

    // Create the Additional Profile For User
    const profileDetails = await profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });

    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedPassword,
      accountType: accountType,
      approved: approved,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });
    //return res
    return res.status(200).json({
      success: true,
      message: "User Is Registered Successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "User cannot be registered. Please try again",
    });
  }
};

//Login
exports.login = async (req, res) => {
  try {
    // get data from req body
    const { email, password } = req.body;
    // validate data
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required, please try again",
      });
    }
    //user check exist or not
    const user = await User.findOne({ email }).populate("additionalDetails");

    // If user not found with provided email
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User is not registered please signup first",
      });
    }
    // Generate JWT token and Compare Password
    if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign(
        { email: user.email, id: user._id, accountType: user.accountType },
        process.env.JWT_SECRET,
        {
          expiresIn: "24h",
        }
      );

      // Save token to user document in database
      user.token = token;
      user.password = undefined;
      //create cookie and send response
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };
      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: "Logged in Successfully",
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Password Is incorrect",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Login Failure, please try again",
    });
  }
};

// sendOTP for Email verification
exports.sendOTP = async (req, res) => {
  try {
    // fetch email from body
    const { email } = req.body.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // check user is already exists
    const checkUserPresent = await User.findOne({ email });

    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: `User already registered`,
      });
    }

    // Generate a unique 6-digit numeric OTP
    let otp;
    let existingOtp;
    do {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
        digits: true,
      });
      existingOtp = await OTP.findOne({ otp });
    } while (existingOtp);

    // create an entry for otp
    await OTP.create({ email, otp });
    // console.log("otpBody", otpBody);

    //to do send notification email

    return res.status(200).json({
      success: true,
      message: "OTP sent Successfully",
      otp,
    });
  } catch (error) {
    // console.log(error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while sending OTP",
      error: error.message,
    });
  }
};

//changePassword
exports.changePassword = async (req, res) => {
  try {
    // Get user data from req.user
    const userDetails = await User.findById(req.user.id);
    // Get old password, new password, and confirm new password from req.body
    const { oldPassword, newPassword } = req.body;

    // Validate old password
    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      userDetails.password
    );
    if (!isPasswordMatch) {
      return res
        .status(401)
        .json({ success: false, message: "The Password is Incorrect" });
    }

    // Update Password
    const encryptedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUserDetails = await User.findByIdAndUpdate(
      req.user.id,
      { password: encryptedPassword },
      { new: true }
    );

    //send notification email
    try {
      await mailSender(
        updatedUserDetails.email,
        passwordUpdated(
          updatedUserDetails.email,
          `password updated successfully for${updatedUserDetails.firstName} ${updatedUserDetails.lastName} `
        )
      );
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error occurred while sending email",
        error: error.message,
      });
    }

    // Return success response
    return res.status(200).json({
      success: true,
      message: "password updated successfully",
    });
  } catch (error) {
    // If there's an error updating the password
    // console.error("Error occurred while updating password:", error);
    return res.status(500).json({
      success: false,
      message: "Error occurred while updating password",
      error: error.message,
    });
  }
};
