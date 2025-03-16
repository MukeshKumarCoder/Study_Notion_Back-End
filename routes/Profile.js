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

router.delete("/deleteprofile", auth, deleteAccount);
router.put("/updateprofile", auth, updateProfile);
router.get("/getuserdetails", auth, getAllUserDetails);

// get Enrolled courses
router.get("/getenrolledcourses", auth, getEnrolledCourses);
router.put("/updatedisplaypicture", auth, updateDisplayPicture);

module.exports = router;
