const { instance } = require("../config/razorPay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const crypto = require("crypto");
const CourseProgress = require("../models/CourseProgress");
const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail");
const {
  paymentSuccessEmail,
} = require("../mail/templates/paymentSuccessEmail");

// capture the payment and initiate the Razorpay order
exports.capturePayment = async (req, res) => {
  const { course_id, id: userId } = req.body;

  // validation
  if (!course_id) {
    return res.status(400).json({
      success: false,
      message: "please provide a valid course ID",
    });
  }

  // valid courseDetails
  try {
    const course = await Course.findById(course_id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if user already enrolled
    const alreadyEnrolled = course.studentEnrolled.some(
      (id) => id.toString() === userId.toString()
    );
    if (alreadyEnrolled) {
      return res.status(200).json({
        success: false,
        message: "Student is already enrolled",
      });
    }

    // Create Razorpay order
    const options = {
      amount: course.price * 100,
      currency: "INR",
      receipt: `${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      notes: {
        courseId: course_id,
        userId,
      },
    };

    //initiate the payment using razorpay
    const paymentResponse = await instance.orders.create(options);

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
      message: "Server error while creating payment",
      error: error.message,
    });
  }
};

// verify Signature of RazorPay and server
exports.verifySignature = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courses,
      id: userId,
    } = req.body;

    const key_secret = process.env.RAZORPAY_SECRET;

    // Generate expected signature
    const hmac = crypto.createHmac("sha256", key_secret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment signature mismatch",
      });
    }

    // ✅ Fetch user details (needed for email)
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ Payment verified → Enroll user in course
    for (const courseId of courses) {
      await Course.findByIdAndUpdate(
        courseId,
        { $push: { studentEnrolled: userId } },
        { new: true }
      );

      await User.findByIdAndUpdate(
        userId,
        { $push: { courses: courseId } },
        { new: true }
      );

      // 3. ✅ Create CourseProgress entry
      const existingProgress = await CourseProgress.findOne({
        courseId,
        userId,
      });

      if (!existingProgress) {
        await CourseProgress.create({
          courseId,
          userId,
          completedVideos: [],
        });
      }

      // ✅ Save Purchase History
      // await PurchaseHistory.create({
      //   user: userId,
      //   course: courseId,
      //   paymentId: razorpay_payment_id,
      //   orderId: razorpay_order_id,
      //   amount: course.price,
      //   status: "SUCCESS",
      // });

      // ✅ Send Enrollment Email
      await mailSender(
        user.email,
        "Course Enrollment Confirmation",
        courseEnrollmentEmail(user.firstName, Course.courseName)
      );

      // ✅ Send Payment Success Email
      await mailSender(
        user.email,
        "Payment Successful",
        paymentSuccessEmail(user.firstName, Course.courseName, Course.price)
      );
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified and course enrollment successful",
    });
  } catch (err) {
    console.error("Payment verify error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error verifying payment",
      error: err.message,
    });
  }
};
