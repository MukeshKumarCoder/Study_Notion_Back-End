const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
require("dotenv").config();

// create a new course
exports.createCourse = async (req, res) => {
  try {
    // Get user ID from request object
    const userId = req.user.id;

    //fetch data
    let {
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      tag: _tag,
      category,
      status,
      instructions: _instructions,
    } = req.body;

    //get thumbnail
    const thumbnail = req.files?.thumbnailImage;

    // Convert the tag and instructions from stringified Array to Array
    const tag = JSON.parse(_tag || "[]");
    const instructions = JSON.parse(_instructions || "[]");

    //validation
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !Array.isArray(tag) ||
      tag.length === 0 ||
      !thumbnail ||
      !category ||
      !Array.isArray(instructions) ||
      instructions.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    status = status || "Draft";

    // Check if the user is an instructor
    const instructor = await User.findById(userId);
    if (!instructor || instructor.accountType !== "Instructor") {
      return res.status(403).json({
        success: false,
        message: "Only instructors can create courses",
      });
    }

    //check given tag is valid or not
    const categoryDetails = await Category.findById(category);
    if (!categoryDetails) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    //Upload Image top Cloudinary
    const thumbnailImage = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    );
    // console.log(thumbnailImage);

    //create an entry for new Course
    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructor._id,
      whatYouWillLearn,
      price,
      tag,
      category: categoryDetails._id,
      thumbnail: thumbnailImage.secure_url,
      status: status,
      instructions,
    });

    //add the new course to the user schema of Instructor
    await User.findByIdAndUpdate(instructor._id, {
      $push: { courses: newCourse._id },
    });

    // Add the new course to the Categories
    await Category.findByIdAndUpdate(category, {
      $push: { course: newCourse._id },
    });

    //return response
    return res.status(201).json({
      success: true,
      message: "Course Created Successfully",
      data: newCourse,
    });
  } catch (error) {
    // console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create Course",
      error: error.message,
    });
  }
};

// Edit Course Details
exports.editCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const updates = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // If Thumbnail Image is found, update it
    if (req.files?.thumbnailImage) {
      const thumbnailImage = await uploadImageToCloudinary(
        req.files.thumbnailImage,
        process.env.FOLDER_NAME
      );
      course.thumbnail = thumbnailImage.secure_url;
    }

    // Update only the fields that are present in the request body
    for (const key in updates) {
      if (key === "tag" || key === "instructions") {
        course[key] = JSON.parse(updates[key]);
      } else if (key !== "courseId") {
        course[key] = updates[key];
      }
    }

    await course.save();

    const updatedCourse = await Course.findById(courseId)
      .populate({
        path: "instructor",
        populate: { path: "additionalDetails" },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: { path: "subSection" },
      });

    // return response
    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (error) {
    // console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

//getAllCourses handler function
exports.getAllCourse = async (req, res) => {
  try {
    const allCourses = await Course.find(
      { status: "Published" },
      {
        courseName: true,
        price: true,
        thumbnail: true,
        instructor: true,
        ratingAndReviews: true,
        studentEnrolled: true,
      }
    ).populate("instructor");

    return res.status(200).json({
      success: true,
      message: "All courses fetched successfully",
      data: allCourses,
    });
  } catch (error) {
    // console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to Fetch courses",
      error: error.message,
    });
  }
};

//get Course Details
exports.getCourseDetails = async (req, res) => {
  try {
    // get id
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    // find course details
    const courseDetails = await Course.findById(courseId)
      .populate({
        path: "instructor",
        populate: { path: "additionalDetails" },
      })
      .populate("category")
      .populate({
        path: "courseContent",
        populate: { path: "subSection" },
      });

    // validation
    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: `No course found with ID: ${courseId}`,
      });
    }

    // return success response
    return res.status(200).json({
      success: true,
      message: "course Details fetched successfully",
      data: courseDetails,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error fetching course details",
      error: error.message,
    });
  }
};
