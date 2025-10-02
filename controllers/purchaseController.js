const Purchase = require("../models/Purchase");

exports.getPurchaseHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const purchases = await Purchase.find({ user: userId })
      .populate("course", "title description price thumbnail")
      .sort({ purchasedAt: -1 });

    res.status(200).json({
      success: true,
      message: "Purchase History Found successfully",
      data: purchases,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching history",
    });
  }
};
