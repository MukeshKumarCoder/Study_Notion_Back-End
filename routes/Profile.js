const router = require("express").Router();
const { auth } = require("../middlewares/auth");
const {
  deleteAccount,
  updateProfile,
  getAllUserDetails,
  updateDisplayPicture,
  getEnrolledCourses,
} = require("../controllers/Profile");

// profile Routes

router.delete("/delete-profile", auth, deleteAccount);
router.put("/update-profile", auth, updateProfile);
router.get("/get-user-details", auth, getAllUserDetails);

// get Enrolled courses
router.get("/get-enrolled-courses", auth, getEnrolledCourses);
router.put("/update-display-picture", auth, updateDisplayPicture);

module.exports = router;
