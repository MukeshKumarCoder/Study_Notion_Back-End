const SubSection = require("../models/SubSection");
const CourseProgress = require("../models/CourseProgress");

exports.updateCourseProgress = async (req, res) => {
  const { courseId, subsectionId } = req.body;
  const userId = req.user.id;

  try {
    // Check if the subsection is valid
    const subsection = await SubSection.findById(subsectionId);
    if (!subsection) {
      return res.status(404).json({
        success: false,
        message: "Invalid subsection",
      });
    }

    // Find the course progress document for the user and course
    let courseProgress = await CourseProgress.findOne({
      courseId: courseId,
      userId: userId,
    });

    if (!courseProgress) {
      // If not exists, create it
      courseProgress = await CourseProgress.create({
        courseId,
        userId,
        completedVideos: [],
      });
    }

    // Check if the subsection is already completed
    if (
      courseProgress.completedVideos.some(
        (id) => id.toString() === subsectionId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Subsection already completed",
      });
    }

    // Add subsection to completedVideos
    courseProgress.completedVideos.push(subsectionId);
    await courseProgress.save();

    return res.status(200).json({
      success: true,
      message: "Lecture marked as complete",
      courseProgress,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
