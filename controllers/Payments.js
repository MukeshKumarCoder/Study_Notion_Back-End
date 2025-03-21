const { instance } = require("../config/razorPay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utilis/mailSender");
const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail");
const { defauld: mongoose } = require("mongoose");

// capture the payment and initiate the Razorpay order
exports.capturePayment = async (req, res) => {
  // get courseId and UserId
  const { course_id } = req.body;
  const userId = req.body.id;
  // validation
  // valid courseId
  if (!course_id) {
    return res.status(400).json({
      success: false,
      message: "please provide valid course Id",
    });
  }
  // valid courseDetails
  let course;
  try {
    course = await Course.findById(course_id);
    if (!course) {
      return res.status(400).json({
        success: false,
        message: "Could not find the Course",
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
    console.error(error);
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
    receipt: Math.random(Date.now()).toString,
    notes: {
      courseId: course_id,
      userId,
    },
  };

  try {
    //initiate the payment using razorpay
    const paymentResponse = await instance.orders.create(options);
    console.log(paymentResponse);
    //return response
    return res.status(200).json({
      success: true,
      courseName: course.courseName,
      courseDectription: course.courseDectription,
      thumbnail: course.thumbnail,
      orderId: paymentResponse.id,
      currency: paymentResponse.currency,
      amount: paymentResponse.amount,
    });
  } catch (error) {
    console.log(error);
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
    console.log("Payment is Authorised");
    const { courseId, userId } = req.body.payload.payment.entity.notes;

    try {
      //fulfill the action
      // find the course and enroll the student in it
      const enrolledCourse = await Course.findOneAndUpdate(
        { _id: courseId },
        { $push: { studentEnrolled: userId } },
        { new: true }
      );

      if (!enrolledCourse) {
        return res.status(500).json({
          success: false,
          message: "Course not found",
        });
      }
      console.log(enrolledCourse);

      //find the student andadd the course to their list enrolled courses

      const enrolledStudent = await User.findOneAndUpdate(
        { _id: userId },
        { $push: { courses: courseId } },
        { new: true }
      );
      console.log(enrolledStudent);

      // mail send to confirm
      const emailResponse = await mailSender(
        enrolledStudent.email,
        "Congratulations from codeHelp",
        "Congratulation, you are onboarded into new CodeHelp course"
      );

      console.log(emailResponse);
      return res.status(200).json({
        success: true,
        message: "Signature verified and course added",
      });
    } catch (error) {
      console.log(eroor);
      return res.status(500).json({
        success: false,
        message: eroor.message,
      });
    }
  } else {
    return res.status(400).json({
      success: false,
      message: "Invalid request",
    });
  }
};
