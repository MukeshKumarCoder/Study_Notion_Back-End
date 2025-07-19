const Profile = require("../models/Profile");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
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

    // TODO: Unenroll User From All the Enrolled Courses

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

    const userDetails = await User.findOne(userId).populate("courses").exec();

    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Courses fetched successfully",
      data: userDetails.courses,
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
