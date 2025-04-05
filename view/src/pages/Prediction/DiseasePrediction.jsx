import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Link } from "react-router-dom";
import NewProductCard from "../../components/NewProductCard";
import DiseasesPanel from "../../components/DiseasesPanel";
import Webcam from 'react-webcam';


const DiseasePrediction = ({ cart, setCart }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [treatmentProducts, setTreatmentProducts] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const [isWebcamMode, setIsWebcamMode] = useState(false);
  const webcamRef = useRef(null);

  // Update the webcam functions to properly handle the camera
  const toggleWebcam = () => {
    setIsWebcamMode(!isWebcamMode);
    setPrediction(null);
    setError(null);
    setSuggestedProducts([]);
    setTreatmentProducts([]);
  };

  const captureImage = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc)
    {
      // Convert base64 to File object
      fetch(imageSrc)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'captured-image.jpeg', { type: 'image/jpeg' });
          setSelectedImage(file);
          setPreviewUrl(imageSrc);
          setIsWebcamMode(false);
          setPrediction(null);
          setError(null);
          setSuggestedProducts([]);
          setTreatmentProducts([]);
        })
        .catch(err => {
          console.error("Error processing captured image:", err);
          setError("Failed to process captured image");
        });
    }
  };



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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file)
    {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setPrediction(null);
      setError(null);
      setSuggestedProducts([]);
      setTreatmentProducts([]);
    }
  };

  const fetchProductsByName = async (name) => {
    try
    {
      // Search for the exact product name
      const response = await axios.get(`/api/v1/crops/search?name=${encodeURIComponent(name)}`);
      console.log('Search response for:', name, response.data);

      // Filter products to match exact name (case-insensitive)
      const exactMatches = response.data.data.crop.filter(product =>
        product.name.toLowerCase() === name.toLowerCase()
      );

      return exactMatches;
    } catch (error)
    {
      console.error('Error fetching products:', error);
      return [];
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImage)
    {
      setError('Please select an image first');
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedImage);

    setLoading(true);
    setError(null);

    try
    {
      // Only add language parameter if it's not English
      const endpoint = selectedLanguage === 'en'
        ? '/api/v1/crops/detect-crop-disease'
        : `/api/v1/crops/detect-crop-disease?lang=${selectedLanguage}`;

      const response = await axios.post(
        endpoint,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setPrediction(response.data);

      if (response.data.predictions && response.data.predictions[0])
      {
        const recommendedProducts = response.data.predictions[0].info.recommendedProducts;
        const treatmentResults = await Promise.all(
          recommendedProducts.map(productName => fetchProductsByName(productName))
        );
        const flattenedTreatmentProducts = treatmentResults.flat().filter(Boolean);
        setTreatmentProducts(flattenedTreatmentProducts);
        setSuggestedProducts([]);
      }
    } catch (err)
    {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally
    {
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
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${active
        ? 'bg-green-500 text-white'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
    >
      {label}
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column - Disease Prediction */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Crop Disease Prediction</h2>

              {/* Language Selector */}
              <div className="mb-6">
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Language
                </label>
                <select
                  id="language"
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Image Upload Section - Updated with webcam toggle */}
              <div className="mb-8">
                {isWebcamMode ? (
                  <div className="flex flex-col items-center">
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{
                        width: 1280,
                        height: 720,
                        facingMode: 'environment'
                      }}
                      className="w-full h-64 object-contain mb-4 rounded-lg border border-gray-300"
                    />
                    <div className="flex gap-4 mt-2">
                      <button
                        onClick={captureImage}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Capture Photo
                      </button>
                      <button
                        onClick={toggleWebcam}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="image-upload"
                        className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                      >
                        {previewUrl ? (
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="max-h-60 object-contain"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg
                              className="w-10 h-10 mb-3 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              ></path>
                            </svg>
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 800x400px)</p>
                          </div>
                        )}
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                    <div className="flex gap-4 mt-4">
                      <button
                        onClick={toggleWebcam}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        Use Camera
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleSubmit}
                  disabled={loading || !selectedImage}
                  className={`px-6 py-3 rounded-lg text-white font-medium ${loading || !selectedImage
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600'
                    }`}
                >
                  {loading ? 'Analyzing...' : 'Predict Disease'}
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Prediction Results */}
              {prediction && prediction.predictions && prediction.predictions[0] && (
                <div className="mt-8 bg-white rounded-lg border border-gray-200">
                  {/* Header Section */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800">
                          {prediction.predictions[0].info.name}
                        </h3>
                        <p className="text-gray-600 mt-1">
                          {prediction.predictions[0].info.scientificName}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          Affects: {prediction.predictions[0].info.cropAffected}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600 mb-1">Confidence</div>
                        <div className="text-2xl font-bold text-gray-800">
                          {(prediction.predictions[0].confidence * 100).toFixed(1)}%
                        </div>
                        {renderConfidenceBar(prediction.predictions[0].confidence)}
                      </div>
                    </div>
                  </div>

                  {/* Navigation Tabs */}
                  <div className="flex gap-2 p-4 border-b border-gray-200 bg-gray-50 overflow-x-auto">
                    <TabButton
                      id="overview"
                      label="Overview"
                      active={activeTab === 'overview'}
                      onClick={setActiveTab}
                    />
                    <TabButton
                      id="symptoms"
                      label="Symptoms"
                      active={activeTab === 'symptoms'}
                      onClick={setActiveTab}
                    />
                    <TabButton
                      id="treatment"
                      label="Treatment"
                      active={activeTab === 'treatment'}
                      onClick={setActiveTab}
                    />
                    <TabButton
                      id="prevention"
                      label="Prevention"
                      active={activeTab === 'prevention'}
                      onClick={setActiveTab}
                    />
                  </div>

                  {/* Content Sections */}
                  <div className="p-6">
                    {activeTab === 'overview' && (
                      <div>
                        <h4 className="text-lg font-semibold mb-4">About the Disease</h4>
                        <p className="text-gray-700 mb-6">
                          {prediction.predictions[0].info.detailedDescription}
                        </p>

                        <h4 className="text-lg font-semibold mb-4">Spreading Conditions</h4>
                        <ul className="list-disc pl-5 space-y-2">
                          {prediction.predictions[0].info.spreadingConditions.map((condition, index) => (
                            <li key={index} className="text-gray-700">{condition}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {activeTab === 'symptoms' && (
                      <div>
                        <h4 className="text-lg font-semibold mb-4">Disease Symptoms</h4>
                        <ul className="list-disc pl-5 space-y-2">
                          {prediction.predictions[0].info.symptoms.map((symptom, index) => (
                            <li key={index} className="text-gray-700">{symptom}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {activeTab === 'treatment' && (
                      <div>
                        <h4 className="text-lg font-semibold mb-4">Recommended Products</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          {prediction.predictions[0].info.recommendedProducts.map((product, index) => (
                            <div key={index} className="bg-green-50 p-3 rounded-lg">
                              <span className="text-green-800">{product}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === 'prevention' && (
                      <div>
                        <h4 className="text-lg font-semibold mb-4">Prevention Methods</h4>
                        <ul className="list-disc pl-5 space-y-2">
                          {prediction.predictions[0].info.prevention.map((method, index) => (
                            <li key={index} className="text-gray-700">{method}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Product Suggestions */}
        <div className="lg:w-1/3 space-y-6">
          {/* Combined Products Section with Tabs */}
          {(treatmentProducts.length > 0 || suggestedProducts.length > 0) && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Product Navigation Tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('treatment')}
                  className={`flex-1 py-3 px-4 text-sm font-medium text-center transition-colors ${activeTab === 'treatment'
                    ? 'bg-green-50 text-green-600 border-b-2 border-green-500'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  Treatment Products
                  {treatmentProducts.length > 0 && (
                    <span className="ml-2 bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-xs">
                      {treatmentProducts.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('related')}
                  className={`flex-1 py-3 px-4 text-sm font-medium text-center transition-colors ${activeTab === 'related'
                    ? 'bg-green-50 text-green-600 border-b-2 border-green-500'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  Related Products
                  {suggestedProducts.length > 0 && (
                    <span className="ml-2 bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-xs">
                      {suggestedProducts.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Products Display */}
              <div className="p-4">
                {activeTab === 'treatment' && treatmentProducts.length > 0 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                      {treatmentProducts.map((product) => (
                        <div
                          key={product._id}
                          className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                        >
                          <Link to={`/crops/${product._id}`}>
                            <NewProductCard
                              cart={cart}
                              cropid={product._id}
                              setCart={setCart}
                              name={product.name}
                              image={product.image}
                              type={product.type}
                              price={product.price}
                              description={product.description}
                              quantity={product.quantity}
                            />
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'related' && suggestedProducts.length > 0 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                      {suggestedProducts.map((product) => (
                        <div
                          key={product._id}
                          className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                        >
                          <Link to={`/crops/${product._id}`}>
                            <NewProductCard
                              cart={cart}
                              cropid={product._id}
                              setCart={setCart}
                              name={product.name}
                              image={product.image}
                              type={product.type}
                              price={product.price}
                              description={product.description}
                              quantity={product.quantity}
                            />
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add DiseasesPanel */}
      <DiseasesPanel />
    </div>
  );
};

export default DiseasePrediction;