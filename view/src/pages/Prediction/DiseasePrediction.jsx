import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Link } from "react-router-dom";
import NewProductCard from "../../components/NewProductCard";
import { Box, Button, Typography, CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { PhotoCamera, Upload, Cameraswitch } from '@mui/icons-material';

const DiseasePrediction = ({ cart, setCart }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [treatmentProducts, setTreatmentProducts] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isUsingCamera, setIsUsingCamera] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'mr', name: 'Marathi' },
    { code: 'hi', name: 'Hindi' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'ja', name: 'Japanese' },
    { code: 'de', name: 'German' },
    { code: 'fr', name: 'French' },
    { code: 'es', name: 'Spanish' }
  ];

  // Function to start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setIsUsingCamera(true);
      setPreviewUrl(null);
      setSelectedFile(null);
    } catch (err) {
      setError('Failed to access camera. Please make sure you have granted camera permissions.');
      console.error('Error accessing camera:', err);
    }
  };

  // Function to stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      videoRef.current.srcObject = null;
      setIsUsingCamera(false);
    }
  };

  // Function to capture photo from camera
  const capturePhoto = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);
    
    // Convert to blob
    canvas.toBlob((blob) => {
      const file = new File([blob], "captured-image.jpg", { type: "image/jpeg" });
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(blob));
      stopCamera();
    }, 'image/jpeg');
  };

  // Function to handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      stopCamera(); // Stop camera if it's running
    }
  };

  const fetchProductsByName = async (name) => {
    try {
      // Search for the exact product name
      const response = await axios.get(`/api/v1/crops/search?name=${encodeURIComponent(name)}`);
      console.log('Search response for:', name, response.data);
      
      // Filter products to match exact name (case-insensitive)
      const exactMatches = response.data.data.crop.filter(product => 
        product.name.toLowerCase() === name.toLowerCase()
      );
      
      return exactMatches;
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select an image or capture one from camera');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      // Only add language parameter if it's not English
      const endpoint = selectedLanguage === 'en'
        ? '/api/v1/crops/detect-crop-disease'
        : `/api/v1/crops/detect-crop-disease?lang=${selectedLanguage}`;

      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResults(response.data);
      
      if (response.data.predictions && response.data.predictions[0]) {
        const recommendedProducts = response.data.predictions[0].info.recommendedProducts;
        const treatmentResults = await Promise.all(
          recommendedProducts.map(productName => fetchProductsByName(productName))
        );
        const flattenedTreatmentProducts = treatmentResults.flat().filter(Boolean);
        setTreatmentProducts(flattenedTreatmentProducts);
        setSuggestedProducts([]);
      }
    } catch (error) {
      console.error('Disease Detection Error:', error);
      setError(error.response?.data?.message || 'Failed to detect disease');
    } finally {
      setLoading(false);
    }
  };

  const renderConfidenceBar = (confidence) => {
    const color = confidence > 0.7 ? 'bg-red-500' : confidence > 0.4 ? 'bg-yellow-500' : 'bg-green-500';
    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
        <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${confidence * 100}%` }}></div>
      </div>
    );
  };

  const TabButton = ({ id, label, active, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        active
          ? 'bg-green-500 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Plant Disease Detection
          </h2>

          {/* Language Selector */}
          <div className="mb-6">
            <FormControl fullWidth variant="outlined">
              <InputLabel>Select Language</InputLabel>
              <Select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                label="Select Language"
              >
                {languages.map((lang) => (
                  <MenuItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          {/* Camera and Upload Section */}
          <div className="space-y-6">
            {/* Camera View */}
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className={`w-full rounded-lg ${isUsingCamera ? 'block' : 'hidden'}`}
              />
              
              {/* Image Preview */}
              {previewUrl && (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full rounded-lg"
                  />
                  <button
                    onClick={() => {
                      setPreviewUrl(null);
                      setSelectedFile(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            {/* Camera Controls */}
            <div className="flex justify-center space-x-4">
              {!isUsingCamera ? (
                <button
                  onClick={startCamera}
                  className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <PhotoCamera className="mr-2" />
                  Open Camera
                </button>
              ) : (
                <button
                  onClick={capturePhoto}
                  className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Cameraswitch className="mr-2" />
                  Capture Photo
                </button>
              )}

              {/* File Upload Button */}
              <label className="flex items-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors cursor-pointer">
                <Upload className="mr-2" />
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>

            {error && (
              <Alert severity="error" className="mt-4">
                {error}
              </Alert>
            )}

            {/* Submit Button */}
            <div className="flex justify-center mt-6">
              <button
                onClick={handleSubmit}
                disabled={!selectedFile || loading}
                className={`px-6 py-3 rounded-lg text-white font-medium transition-all duration-300 ${
                  !selectedFile || loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 hover:shadow-lg transform hover:-translate-y-1'
                }`}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Detect Disease'
                )}
              </button>
            </div>
          </div>

          {/* Results Section */}
          {results && results.predictions && results.predictions.length > 0 && (
            <div className="mt-8 p-6 bg-white rounded-lg border border-gray-200">
              <h3 className="text-xl font-semibold mb-4">Detection Results</h3>
              {results.predictions.map((prediction, index) => (
                <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-lg">{prediction.disease}</p>
                      <p className="text-gray-600">{prediction.info.scientificName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Confidence</p>
                      <p className="font-bold text-lg">
                        {(prediction.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-gray-700">{prediction.info.detailedDescription}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiseasePrediction; 