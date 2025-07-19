const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");

const OTPSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      expires: 5 * 60,
    },
  },
  {
    timestamps: true,
  }
);

// Define a function to send mail
async function sendVerificationEmail(email, otp) {
  try {
    const mailResponse = await mailSender(
      email,
      "Verification Email from StudyNotion",
      emailTemplate(otp)
    );
  } catch (error) {
    console.log("Error occurred while sending verification email: ", error);
    throw error;
  }
}

// Hook: Send email after saving a new OTP document
OTPSchema.pre("save", async function (next) {
  if (this.isNew) {
    await sendVerificationEmail(this.email, this.otp);
  }
  next();
});

module.exports = mongoose.model("OTP", OTPSchema);
