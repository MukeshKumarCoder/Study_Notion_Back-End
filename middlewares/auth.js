const jwt = require("jsonwebtoken");
require("dotenv").config();

// Middleware to authenticate the user using JWT token
exports.auth = async (req, res, next) => {
  try {
    const token =
      req.cookies.token ||
      req.body.token ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is missing",
      });
    }

    //verify the token
    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decode;
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while validating the token",
    });
  }
};

// Middleware to allow only Students
exports.isStudent = async (req, res, next) => {
  try {
    if (req.User.accountType !== "Student") {
      return res.status(403).json({
        success: false,
        message: "Access denied: Students only",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error verifying student access",
    });
  }
};

// Middleware to allow only Instructors
exports.isInstructor = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Instructor") {
      return res.status(403).json({
        success: false,
        message: "Access denied: Instructors only",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error verifying instructor access",
    });
  }
};

// Middleware to allow only Admins
exports.isAdmin = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied: Admins only",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error verifying admin access",
    });
  }
};
