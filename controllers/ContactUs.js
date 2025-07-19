const { contactUsEmail } = require("../mail/templates/contactFormResponse");
const mailSender = require("../utils/mailSender");

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
    const emailRes = await mailSender(
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
