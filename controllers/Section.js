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
    // create a new section with the given name
    const newSection = await Section.create({ sectionName });

    // Add the new section to the course content array
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

    // return the updated course object in the response
    return res.status(200).json({
      success: true,
      message: "Section created successfully",
      updatedCourse,
    });
  } catch (error) {
    console.log(error);
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
      message: section,
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
    //HW -> req.params -> test
    const { sectionId } = req.params;
    await Section.findByIdAndDelete(sectionId);
    //HW -> Course ko bhi update karo
    return res.status(200).json({
      success: true,
      message: "Section deleted",
    });
  } catch (error) {
    console.error("Error deleting section:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
