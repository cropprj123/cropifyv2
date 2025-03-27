const path = require("path");
const express = require("express");
const morgan = require("morgan");
const cookieparser = require("cookie-parser");
const cropRouter = require("./routes/cropRoutes");
const userRouter = require("./routes/userRoutes");
const emailRouter = require("./routes/emailRoute");
const AppError = require("./utils/appErrors");
const bookingRouter = require("./routes/bookingRoutes");
const reviewRouter = require("./routes/reviewRoute");
const StoreRouter = require("./routes/storeRoutes");
const addtocartRouter = require("./routes/addtocartRoute");
const chatRouter = require("./routes/chatRoute");
const aiRouter = require("./routes/aiRoutes");
const farmerDiseaseLocationRouter = require("./routes/farmerDiseaseLocationRoutes");
const speechToTextRoute = require("./routes/speechToTextRoute");
const app = express();
const cors = require("cors");

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.json());
//app.use(express.urlencoded({ extended: true }));
app.use(cookieparser());
app.use(
  cors({
    origin: ["http://localhost:5174", "http://localhost:5173"],
    credentials: true,
    origin: true,
    optionsSuccessStatus: 200,
    allowedHeaders: [
      "set-cookie",
      "Content-Type",
      "Access-Control-Allow-Origin",
      "Access-Control-Allow-Credentials",
    ],
  })
);
// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//     allowedHeaders: [
//       "set-cookie",
//       "Content-Type",
//       "Access-Control-Allow-Origin",
//       "Access-Control-Allow-Credentials",
//     ],
//   })
// );

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.use("/api/v1/crops", cropRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/email", emailRouter);

app.use("/api/v1/bookings", bookingRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/store", StoreRouter);
app.use("/api/v1/cart", addtocartRouter);
app.use("/api/v1/ai", chatRouter);
app.use("/api/v1/ai", aiRouter);
app.use("/api/v1/farmer-disease-locations", farmerDiseaseLocationRouter);
app.use("/api/v1/speech-to-text", speechToTextRoute);
app.all("*", (req, res, next) => {
  next(new AppError(`can't find the ${req.originalUrl} url`));
});

module.exports = app;
