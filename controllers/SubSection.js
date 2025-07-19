const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
require("dotenv").config();

// create sub-section
exports.createSubSection = async (req, res) => {
  try {
    const { sectionId, title, description } = req.body;
    const video = req.files?.video;

    if (!sectionId || !title || !description || !video) {
      return res.status(404).json({
        success: false,
        message: "All fields are required",
      });
    }

    // upload the video to cloudinary
    const uploadDetails = await uploadImageToCloudinary(
      video,
      process.env.FOLDER_NAME
    );

    // Create a new sub-section
    const subSectionDetails = await SubSection.create({
      title,
      timeDuration: `${uploadDetails.duration}`,
      description,
      videoUrl: uploadDetails.secure_url,
    });

    // Update the corresponding section with the newly created sub-section
    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      { $push: { subSection: subSectionDetails._id } },
      { new: true }
    ).populate("subSection");

    return res.status(200).json({
      success: true,
      message: "Sub-Section created Successfully",
      data: updatedSection,
    });
  } catch (error) {
    console.log("Error while creating sub-section:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update Sub-Section
exports.updateSubSection = async (req, res) => {
  try {
    const { sectionId, title, description } = req.body;

    const subSection = await SubSection.findById(sectionId);
    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      });
    }

    if (title) subSection.title = title;
    if (description) subSection.description = description;

    if (req.files?.video) {
      const video = req.files.video;
      const uploadDetails = await uploadImageToCloudinary(
        video,
        process.env.FOLDER_NAME
      );
      subSection.videoUrl = uploadDetails.secure_url;
      subSection.timeDuration = `${uploadDetails.duration}`;
    }

    await subSection.save();

    return res.status(200).json({
      success: true,
      message: "Section updated successfully",
    });
  } catch (error) {
    console.error("Error while updating sub-section:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the sub-section",
    });
  }
};

// Delete Sub-Section
exports.deleteSubSection = async (req, res) => {
  try {
    const { subSectionId, sectionId } = req.body;

    const subSection = await SubSection.findByIdAndDelete(subSectionId);
    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      });
    }

    await Section.findByIdAndUpdate(
      sectionId,
      { $pull: { subSection: subSectionId } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "SubSection deleted successfully",
    });
  } catch (error) {
    console.error("Error while deleting sub-section:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the sub-section",
    });
  }
};
