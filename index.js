const express = require("express");
const app = express();

const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const paymentRoutes = require("./routes/Payments");
const courseRoutes = require("./routes/Course");
const contactUsRoute = require("./routes/Contact");
const purchaseRoutes = require("./routes/Purchase");

const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
require("dotenv").config();

const PORT = process.env.PORT || 4000;

//database connect
database.connect();

//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);

//cloudinary connection
cloudinaryConnect();

// Routes
app.use("/api/auth", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/contact", contactUsRoute);
app.use("/api/purchase", purchaseRoutes);


app.get("/", (req, res) => {
  res.send("API is running...");
});

app.listen(PORT, () => {
  console.log(`App is running at ${PORT}`);
});
