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
      courseID: courseId,
      userId: userId,
    });

    if (!courseProgress) {
      return res.status(404).json({
        success: false,
        message: "Course progress does not exist",
      });
    }

    // Check if the subsection is already completed
    if (courseProgress.completedVideos.includes(subsectionId)) {
      return res.status(400).json({ error: "Subsection already completed" });
    }

    // Add subsection to completedVideos
    courseProgress.completedVideos.push(subsectionId);
    await courseProgress.save();

    return res.status(200).json({ message: "Course progress updated" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
