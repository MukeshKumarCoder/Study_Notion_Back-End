const express = require("express");
const router = express.Router();
const { contactUsController } = require("../controllers/ContactUs");

// Route for handling contact form submissions
router.post("/", contactUsController);

module.exports = router;
