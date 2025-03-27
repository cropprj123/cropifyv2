const express = require("express");
const axios = require("axios");
const cropController = require("./../controllers/cropController");
const multer = require("multer");
const fs = require("fs");
const FormData = require("form-data");
const Crop = require("./../models/cropModel");
const translateMiddleware = require("./../controllers/translationController");
const authController = require("./../controllers/authController");

const router = express.Router();
const FLASK_SERVER_URL = "http://127.0.0.1:5000/";
const upload = multer();

// Middleware to apply translation only if `lang` query parameter exists
const conditionalTranslateMiddleware = (req, res, next) => {
  if (req.query.lang) {
    translateMiddleware(req, res, next);
  } else {
    next();
  }
};

// Apply middleware only for routes that should support translation
router.get("/infopredict", conditionalTranslateMiddleware, (req, res) => {
  const inputData = req.query.data.map(parseFloat);
  axios
    .post(`${FLASK_SERVER_URL}/withinfo_predict_crop`, { data: inputData })
    .then((response) => {
      res.json({
        crop: response.data.prediction[0],
        nitrogen: { description: response.data.n_desc },
        phosphorus: { description: response.data.p_desc },
        potassium: { description: response.data.k_desc },
        message: response.data.message,
      });
    })
    .catch((error) => {
      console.error("Prediction Error:", error);
      res.status(500).json({ error: "Prediction failed" });
    });
});

router.get("/predict", conditionalTranslateMiddleware, (req, res) => {
  const inputData = req.query.data.map(parseFloat);
  axios
    .post(`${FLASK_SERVER_URL}/predict_crop`, { data: inputData })
    .then((response) => res.json({ prediction: response.data }))
    .catch((error) => {
      console.error("Prediction Error:", error);
      res.status(500).json({ error: "Prediction failed" });
    });
});

router.get("/singlecrop", conditionalTranslateMiddleware, (req, res) => {
  const inputData = req.query.data.map(parseFloat);
  axios
    .post(`${FLASK_SERVER_URL}/singlecrop`, { data: inputData })
    .then((response) => res.json({ prediction: response.data }))
    .catch((error) => {
      console.error("Prediction Error:", error);
      res.status(500).json({ error: "Prediction failed" });
    });
});

router.get("/predictfertilizer", conditionalTranslateMiddleware, (req, res) => {
  const inputData = req.query.data.map(parseFloat);
  axios
    .post(`${FLASK_SERVER_URL}/predict_fertilizer`, { data: inputData })
    .then((response) => res.json({ prediction: response.data.prediction }))
    .catch((error) => {
      console.error("Prediction Error:", error);
      res.status(500).json({ error: "Prediction failed" });
    });
});

// Crop disease detection with translation check
router.post(
  "/detect-crop-disease",
  conditionalTranslateMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image uploaded" });
      }

      const formData = new FormData();
      formData.append("image", req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });

      const response = await axios.post(
        `${FLASK_SERVER_URL}/detect_crop_disease`,
        formData,
        {
          headers: { ...formData.getHeaders() },
        }
      );

      res.json(response.data);
    } catch (error) {
      console.error("Crop Disease Detection Error:", error);
      res.status(500).json({
        error: "Crop disease detection failed",
        details: error.message,
      });
    }
  }
);

// Video disease detection route
router.post(
  "/detect-crop-disease-video",
  conditionalTranslateMiddleware,
  upload.single("video"),
  async (req, res) => {
    try {
      // Check if video was uploaded
      if (!req.file) {
        return res.status(400).json({ error: "No video uploaded" });
      }

      // Check if the file is a video
      if (!req.file.mimetype.startsWith('video/')) {
        return res.status(400).json({ error: "Uploaded file is not a video" });
      }

      // Create FormData
      const formData = new FormData();
      formData.append("video", req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });

      // Forward to Flask API
      const response = await axios.post(
        `${FLASK_SERVER_URL}/detect_crop_disease_video`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
        }
      );

      // Send predictions back to client
      res.json(response.data);
    } catch (error) {
      console.error("Video Disease Detection Error:", error);
      res.status(500).json({
        error: "Video disease detection failed",
        details: error.message,
      });
    }
  }
);

router.get("/popular", conditionalTranslateMiddleware, (req, res) => {
  axios
    .get(`${FLASK_SERVER_URL}/popular`)
    .then((response) => {
      const graphs = response.data;
      // console.log("got ", response.data);
      res.json({ graphs });
    })
    .catch((error) => {
      console.error("Graph Error:", error);
      res.status(500).json({ error: "Graph failed" });
    });
});

router.get("/getratings", conditionalTranslateMiddleware, (req, res) => {
  // Extract input data from query parameters or request body
  // const inputData = req.query.data; // Assuming data for prediction is sent in the query string
  // const inputData = req.query.data.map(parseFloat);
  // Make a POST request to the Flask server's prediction endpoint
  axios
    .get(`${FLASK_SERVER_URL}/ratings`)
    .then((response) => {
      // Extract the prediction from the response and send it back to the client
      // console.log("respons of prediction", response);
      //changed response obj
      const graphs = response.data;
      // console.log("got ", response.data);
      res.json({ graphs });
    })
    .catch((error) => {
      console.error("Graph Error:", error);
      res.status(500).json({ error: "Graph failed" });
    });
});

router.get("/search", conditionalTranslateMiddleware, async (req, res) => {
  try {
    const searchQuery = req.query.name;
    
    // Find crops where the name, type or description matches the search query
    const crops = await Crop.find({
      $or: [
        { name: { $regex: searchQuery, $options: 'i' } },
        { type: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } }
      ]
    });

    res.status(200).json({
      status: 'success',
      data: {
        crop: crops
      }
    });
  } catch (error) {
    console.error('Search Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error searching for crops'
    });
  }
});

// Sales Forecast route
router.post("/forecast", conditionalTranslateMiddleware, async (req, res) => {
  try {
    const { year, month } = req.body;
    
    if (!year || !month) {
      return res.status(400).json({ 
        error: "Year and month are required" 
      });
    }

    // Forward to Flask API
    const response = await axios.post(`${FLASK_SERVER_URL}/forecast`, {
      year,
      month
    });

    res.json(response.data);
  } catch (error) {
    console.error("Forecast Error:", error);
    res.status(500).json({
      error: "Sales forecast failed",
      details: error.message
    });
  }
});

router
  .route("/")
  .post(
    cropController.uploadimage,
    cropController.resizeProductImage,
    cropController.createCrop
  )
  .get(cropController.getCrop);

router
  .route("/:id")
  .get(cropController.getsinglecrop)
  .patch(
    authController.protect,
    authController.restrictTo("admin"),
    cropController.uploadimage,
    cropController.resizeProductImage,
    cropController.updatecrop
  )
  .delete(cropController.deleteCrop);

module.exports = router;
