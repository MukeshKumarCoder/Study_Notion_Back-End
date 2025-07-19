const Section = require("../models/Section");
const Course = require("../models/Course");

// create a new section
exports.createSection = async (req, res) => {
  try {
    const { sectionName, courseId } = req.body;

    // validate
    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Missing required properties",
      });
    }
    // create a new section
    const newSection = await Section.create({ sectionName });

    // Add the new section to the course
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          courseContent: newSection._id,
        },
      },
      {
        new: true,
      }
    )
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();

    return res.status(200).json({
      success: true,
      message: "Section created successfully",
      updatedCourse,
    });
  } catch (error) {
    console.error("Error creating section:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// update a section
exports.updateSection = async (req, res) => {
  try {
    const { sectionName, sectionId } = req.body;

    const section = await Section.findByIdAndUpdate(
      sectionId,
      { sectionName },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Section updated successfully",
      section,
    });
  } catch (error) {
    console.log("Error updating section:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// delete a section
exports.deleteSection = async (req, res) => {
  try {
    const { sectionId } = req.params;

    // Find the section to get the courseId
    const section = await Section.findById(sectionId);
    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    // Delete the section
    await Section.findByIdAndDelete(sectionId);

    // Remove section reference from Course
    await Course.findByIdAndUpdate(
      { courseContent: sectionId },
      { $pull: { courseContent: sectionId } }
    );

    return res.status(200).json({
      success: true,
      message: "Section deleted and course updated",
    });
  } catch (error) {
    console.error("Error deleting section:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
