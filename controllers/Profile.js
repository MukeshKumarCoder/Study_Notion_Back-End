const Profile = require("../models/Profile");
const User = require("../models/User");
const Course = require("../models/Course");
const CourseProgress = require("../models/CourseProgress");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const mongoose = require("mongoose");
const { convertSecondsToDuration } = require("../utils/setToDuration");
require("dotenv").config();

// method for updating a profile
exports.updateProfile = async (req, res) => {
  try {
    const {
      firstName = "",
      lastName = "",
      dateOfBirth = "",
      about = "",
      contactNumber,
      gender,
    } = req.body;

    const userId = req.user.id;

    // Fetch user and profile
    const userDetails = await User.findById(userId);
    const profile = await Profile.findById(userDetails.additionalDetails);

    // Update user info
    userDetails.firstName = firstName;
    userDetails.lastName = lastName;
    await userDetails.save();

    // update the profile fields
    profile.dateOfBirth = dateOfBirth;
    profile.about = about;
    profile.contactNumber = contactNumber;
    profile.gender = gender;

    // save the updated profile
    await profile.save();

    // Find the updated user details
    const updatedUserDetails = await User.findById(userId)
      .populate("additionalDetails")
      .exec();

    return res.status(200).json({
      success: true,
      message: "profile updated successfully",
      updatedUserDetails,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

// Delete user account
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete Profile
    await Profile.findByIdAndDelete(user.additionalDetails);

    // Unenroll User From All the Enrolled Courses
    await Course.updateMany(
      { studentsEnrolled: userId },
      { $pull: { studentsEnrolled: userId } }
    );

    await CourseProgress.deleteMany({ userId });

    // Delete User
    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    return res.status(500).json({
      success: false,
      message: "User could not be deleted",
      error: error.message,
    });
  }
};

// Get user details
exports.getAllUserDetails = async (req, res) => {
  try {
    const userId = req.user.id;

    const userDetails = await User.findById(userId)
      .populate("additionalDetails")
      .exec();

    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User Data fetched successfully",
      data: userDetails,
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user details",
      error: error.message,
    });
  }
};

// Update profile picture
exports.updateDisplayPicture = async (req, res) => {
  try {
    const displayPicture = req.files?.displayPicture;
    const userId = req.user?.id;

    if (!displayPicture) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    );

    const updateProfile = await User.findByIdAndUpdate(
      userId,
      { image: image.secure_url },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Profile picture updated successfully",
      data: updateProfile,
    });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile picture",
      error: error.message,
    });
  }
};

// Get all enrolled courses
exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    let user = await User.findById(userId)
      .populate({
        path: "courses",
        populate: {
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        },
      })
      .exec();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user = user.toObject();

    for (let i = 0; i < user.courses.length; i++) {
      const course = user.courses[i];
      let totalDurationInSeconds = 0;

      course.courseContent.forEach((content) => {
        content.subSection.forEach((sub) => {
          totalDurationInSeconds += parseInt(sub.timeDuration || 0);
        });
      });

      const totalDuration = convertSecondsToDuration(totalDurationInSeconds);

      let courseProgress = await CourseProgress.findOne({
        courseId: course._id,
        userId,
      });

      const completedVideos = courseProgress?.completedVideos?.length || 0;
      const totalSubsections = course.courseContent.reduce(
        (acc, curr) => acc + (curr.subSection?.length || 0),
        0
      );

      const progressPercentage =
        totalSubsections === 0
          ? 0
          : Math.round((completedVideos / totalSubsections) * 100 * 100) / 100;

      user.courses[i].totalDuration = totalDuration;
      user.courses[i].progressPercentage = progressPercentage;
    }

    return res.status(200).json({
      success: true,
      message: "Courses fetched successfully",
      data: user.courses,
    });
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
      error: error.message,
    });
  }
};

// Get Instructor Data
exports.instructorDashboard = async (req, res) => {
  try {
    const courseDetails = await Course.find({ instructor: req.user.id });

    const courseData = courseDetails.map((course) => {
      const totalStudentsEnrolled = course.studentEnrolled.length;
      const totalAmountGenerated = totalStudentsEnrolled * course.price;

      // Create a new object with the additional fields
      const courseDataWithStats = {
        _id: course._id,
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        // Include other course properties as needed
        totalStudentsEnrolled,
        totalAmountGenerated,
      };

      return courseDataWithStats;
    });

    res.status(200).json({ courses: courseData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};


