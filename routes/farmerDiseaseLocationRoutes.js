const express = require('express');
const farmerDiseaseLocationController = require('../controllers/farmerDiseaseLocationController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router
  .route('/')
  .post(
    farmerDiseaseLocationController.uploadDiseaseImage,
    farmerDiseaseLocationController.createDiseaseLocation
  )
  .get(farmerDiseaseLocationController.getAllDiseaseLocations);

router.get('/nearby', farmerDiseaseLocationController.getNearbyDiseases);

router.get('/stats', farmerDiseaseLocationController.getDiseaseLocationStats);

module.exports = router;