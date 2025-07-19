const { instance } = require("../config/razorPay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const mongoose = require("mongoose");
const crypto = require("crypto");

// capture the payment and initiate the Razorpay order
exports.capturePayment = async (req, res) => {
  // get courseId and UserId
  const { course_id, id: userId } = req.body;
  // validation
  if (!course_id) {
    return res.status(400).json({
      success: false,
      message: "please provide a valid course ID",
    });
  }
  // valid courseDetails
  let course;
  try {
    course = await Course.findById(course_id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // user already paid for same course
    const uid = new mongoose.Types.ObjectId(userId);
    if (course.studentEnrolled.includes(uid)) {
      return res.status(200).json({
        success: false,
        message: "Student is already enrolled",
      });
    }
  } catch (error) {
    console.error("Error fetching course:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }

  // order create
  const amount = course.price;
  const currency = "INR";

  const options = {
    amount: amount * 100,
    currency,
    receipt: `${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    notes: {
      courseId: course_id,
      userId,
    },
  };

  try {
    //initiate the payment using razorpay
    const paymentResponse = await instance.orders.create(options);
    // console.log(paymentResponse);
    //return response
    return res.status(200).json({
      success: true,
      courseName: course.courseName,
      courseDescription: course.courseDescription,
      thumbnail: course.thumbnail,
      orderId: paymentResponse.id,
      currency: paymentResponse.currency,
      amount: paymentResponse.amount,
    });
  } catch (error) {
    console.error("Error initiating payment:", error);
    return res.status(500).json({
      success: false,
      message: "Could not initiate order",
    });
  }
};

// verify Signature of RazorPay and server
exports.verifySignature = async (req, res) => {
  const webhookSecret = "12345678";
  const signature = req.headers["x-razorpay-signature"];

  const shasum = crypto.createHmac("sha256", webhookSecret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  if (signature === digest) {
    const { courseId, userId } = req.body.payload.payment.entity.notes;

    try {
      // find the course and enroll the student in it
      const enrolledCourse = await Course.findOneAndUpdate(
        { _id: courseId },
        { $push: { studentEnrolled: userId } },
        { new: true }
      );

      if (!enrolledCourse) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      //find the student and add the course to their list enrolled courses

      const enrolledStudent = await User.findByIdAndUpdate(
        { _id: userId },
        { $push: { courses: courseId } },
        { new: true }
      );

      // mail send to confirm
      await mailSender(
        enrolledStudent.email,
        "Congratulations from Study Notion",
        "Congratulations! You are enrolled in the new CodeHelp course."
      );

      return res.status(200).json({
        success: true,
        message: "Signature verified and course added",
      });
    } catch (error) {
      console.error("Error verifying signature:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  } else {
    return res.status(400).json({
      success: false,
      message: "Invalid signature",
    });
  }
};
