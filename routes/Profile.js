const router = require("express").Router();
const { auth, isInstructor } = require("../middlewares/auth");
const {
  deleteAccount,
  updateProfile,
  getAllUserDetails,
  updateDisplayPicture,
  getEnrolledCourses,
  instructorDashboard,
} = require("../controllers/Profile");

// profile Routes

router.delete("/delete-profile", auth, deleteAccount);
router.put("/update-profile", auth, updateProfile);
router.get("/get-user-details", auth, getAllUserDetails);

// get Enrolled courses
router.get("/get-enrolled-courses", auth, getEnrolledCourses);
router.put("/update-display-picture", auth, updateDisplayPicture);
router.get("/instructorDashboard", auth, isInstructor, instructorDashboard);

module.exports = router;
