const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["success", "failed", "pending"],
    default: "success",
  },
  purchasedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Purchase", purchaseSchema);
