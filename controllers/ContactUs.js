const { contactUsEmail } = require("../mail/templates/contactFormResponse");
const mailSender = require("../utils/mailSender");
require("dotenv").config();

exports.contactUsController = async (req, res) => {
  const { email, firstName, lastName, message, phoneNo, countryCode } =
    req.body;

  // Input validation
  if (
    !email ||
    !firstName ||
    !lastName ||
    !message ||
    !phoneNo ||
    !countryCode
  ) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }
  try {
    // 1. Send to admin
    await mailSender(
      process.env.MAIL_USER,
      "New Contact Form Submission",
      contactUsEmail(email, firstName, lastName, message, phoneNo, countryCode)
    );

    // 2. Send to user
    await mailSender(
      email,
      "Your Data send successfully",
      contactUsEmail(email, firstName, lastName, message, phoneNo, countryCode)
    );
    // console.log("Email Res ", emailRes);

    return res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send email. Please try again later.",
      error: error.message,
    });
  }
};
