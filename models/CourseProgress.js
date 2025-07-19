const mongoose = require("mongoose");

const courseProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    completedVideos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubSection",
        default: [],
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CourseProgress", courseProgressSchema);
