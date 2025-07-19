const mongoose = require("mongoose");
require("dotenv").config();

exports.connect = async () => {
  try {
    mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("DB Connected Successfully");
  } catch (error) {
    console.error("DB Connection Failed");
    console.error(error);
    process.exit(1);
  }
};
