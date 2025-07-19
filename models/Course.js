const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    courseName: {
      type: String,
      required: true,
      trim: true,
    },
    courseDescription: {
      type: String,
      required: true,
      trim: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    whatYouWillLearn: {
      type: String,
      trim: true,
    },
    courseContent: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Section",
      },
    ],
    ratingAndReviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RatingAndReview",
      },
    ],
    price: {
      type: Number,
      required: true,
    },
    thumbnail: {
      type: String,
      trim: true,
    },
    tag: {
      type: [String],
      required: true,
      default: [],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    studentEnrolled: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    instructions: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["Draft", "Published"],
      default: "Draft",
    },
  },
  {
    timestamps: true, 
  }
);

module.exports = mongoose.model("Course", courseSchema);
