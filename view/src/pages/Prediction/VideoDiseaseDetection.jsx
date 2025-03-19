import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  CircularProgress, 
  Alert, 
  Paper, 
  Grid,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress
} from '@mui/material';
import { 
  CloudUpload,
  ExpandMore,
  Warning,
  Science,
  LocalFlorist,
  Grass,
  Spa,
  ShoppingCart,
  Info
} from '@mui/icons-material';
import axios from 'axios';
import { Link } from "react-router-dom";
import NewProductCard from "../../components/NewProductCard";

const VideoDiseaseDetection = ({ cart, setCart }) => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [preview, setPreview] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [productTab, setProductTab] = useState('treatment');
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [treatmentProducts, setTreatmentProducts] = useState([]);

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

  const handleVideoSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setSelectedVideo(file);
        setPreview(URL.createObjectURL(file));
        setError(null);
        // Reset products and results when a new video is selected
        setSuggestedProducts([]);
        setTreatmentProducts([]);
        setResults(null);
      } else {
        setError('Please select a valid video file');
      }
    }
  };

  const handleSubmit = async () => {
    if (!selectedVideo) {
      setError('Please select a video first');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('video', selectedVideo);

    try {
      const response = await axios.post('/api/v1/crops/detect-crop-disease-video', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResults(response.data.predictions);
      
      // Only fetch treatment products based on recommendedProducts array
      if (response.data.predictions && response.data.predictions[0]) {
        const recommendedProducts = response.data.predictions[0].info.recommendedProducts;
        
        // Fetch each recommended product
        const treatmentResults = await Promise.all(
          recommendedProducts.map(productName => fetchProductsByName(productName))
        );
        
        // Flatten the results and remove any empty arrays
        const flattenedTreatmentProducts = treatmentResults.flat().filter(Boolean);
        setTreatmentProducts(flattenedTreatmentProducts);
        
        // Clear suggested products since we're not using them
        setSuggestedProducts([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while analyzing the video');
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
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column - Video Upload and Results */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Video Disease Detection</h2>
              
              {/* Video Upload Section */}
              <div className="mb-8">
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="video-upload"
                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-green-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all duration-300"
                  >
                    {preview ? (
                      <video
                        src={preview}
                        controls
                        className="max-h-60 w-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <CloudUpload className="w-12 h-12 mb-3 text-green-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">MP4, AVI, MOV (MAX. 100MB)</p>
                      </div>
                    )}
                    <input
                      id="video-upload"
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={handleVideoSelect}
                    />
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleSubmit}
                  disabled={loading || !selectedVideo}
                  className={`px-8 py-3 rounded-lg text-white font-medium shadow-md transition-all duration-300 ${
                    loading || !selectedVideo
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-500 hover:bg-green-600 hover:shadow-lg transform hover:-translate-y-1'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing...
                    </div>
                  ) : 'Start Analysis'}
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-red-600 text-sm flex items-center">
                    <Warning className="mr-2" fontSize="small" />
                    {error}
                  </p>
                </div>
              )}

              {/* Results Section */}
              {results && results[0] && (
                <div className="mt-8 bg-white rounded-lg border border-gray-200 shadow-md">
                  {/* Header Section */}
                  <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-white">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800">
                          {results[0].disease}
                        </h3>
                        <p className="text-gray-600 mt-1 italic">
                          {results[0].info.scientificName}
                        </p>
                        <div className="mt-3 flex items-center">
                          <Chip 
                            icon={<LocalFlorist />} 
                            label={`Affects: ${results[0].info.cropAffected}`} 
                            variant="outlined" 
                            color="primary"
                            className="mr-2"
                          />
                          <Chip 
                            icon={<Info />} 
                            label={`Detected in ${results[0].count} frames`} 
                            variant="outlined" 
                            color="secondary"
                          />
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600 mb-1">Confidence</div>
                        <div className="text-2xl font-bold text-gray-800">
                          {(results[0].confidence * 100).toFixed(1)}%
                        </div>
                        {renderConfidenceBar(results[0].confidence)}
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
                        <h4 className="text-lg font-semibold mb-4 text-green-700">About the Disease</h4>
                        <p className="text-gray-700 mb-6 leading-relaxed">
                          {results[0].info.detailedDescription}
                        </p>
                        
                        <h4 className="text-lg font-semibold mb-4 text-green-700">Spreading Conditions</h4>
                        <ul className="list-disc pl-5 space-y-2">
                          {results[0].info.spreadingConditions.map((condition, index) => (
                            <li key={index} className="text-gray-700">{condition}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {activeTab === 'symptoms' && (
                      <div>
                        <h4 className="text-lg font-semibold mb-4 text-green-700">Disease Symptoms</h4>
                        <ul className="list-disc pl-5 space-y-2">
                          {results[0].info.symptoms.map((symptom, index) => (
                            <li key={index} className="text-gray-700">{symptom}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {activeTab === 'treatment' && (
                      <div>
                        <h4 className="text-lg font-semibold mb-4 text-green-700">Recommended Treatments</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          {results[0].info.treatment.chemical.map((treatment, index) => (
                            <div key={index} className="bg-red-50 p-4 rounded-lg border border-red-100 shadow-sm">
                              <div className="flex items-start">
                                <Warning className="text-red-500 mr-2 mt-1" />
                                <span className="text-red-800">{treatment}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <h4 className="text-lg font-semibold mb-4 mt-6 text-green-700">Organic Solutions</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          {results[0].info.treatment.organic.map((treatment, index) => (
                            <div key={index} className="bg-green-50 p-4 rounded-lg border border-green-100 shadow-sm">
                              <div className="flex items-start">
                                <Spa className="text-green-500 mr-2 mt-1" />
                                <span className="text-green-800">{treatment}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === 'prevention' && (
                      <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Prevention Methods Section */}
                          <div>
                            <h4 className="text-lg font-semibold mb-4 text-green-700">Prevention Methods</h4>
                            <ul className="space-y-3">
                              {results[0].info.prevention.map((method, index) => (
                                <li key={index} className="bg-blue-50 p-4 rounded-lg border border-blue-100 shadow-sm flex items-start">
                                  <span className="text-blue-800 mr-2">•</span>
                                  <span className="text-gray-700">{method}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Recommended Products Section */}
                          <div>
                            <h4 className="text-lg font-semibold mb-4 text-green-700">Recommended Products</h4>
                            <div className="space-y-3">
                              {results[0].info.recommendedProducts.map((product, index) => (
                                <div key={index} className="bg-green-50 p-4 rounded-lg border border-green-100 shadow-sm">
                                  <div className="flex items-start">
                                    <ShoppingCart className="text-green-500 mr-2 mt-1" />
                                    <span className="text-green-800">{product}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Products and Additional Information */}
        <div className="lg:w-1/3 space-y-6">
          {results && results[0] && (
            <>
              {/* Product Recommendations */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-green-500 p-4">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <ShoppingCart className="mr-2" />
                    Recommended Products
                  </h3>
                </div>
                
                {/* Product Tabs */}
                <div className="flex border-b border-gray-200">
                  <button
                    onClick={() => setProductTab('treatment')}
                    className={`flex-1 py-3 px-4 text-sm font-medium text-center transition-colors ${
                      productTab === 'treatment'
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
                    onClick={() => setProductTab('related')}
                    className={`flex-1 py-3 px-4 text-sm font-medium text-center transition-colors ${
                      productTab === 'related'
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
                  {productTab === 'treatment' && (
                    <>
                      {treatmentProducts.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                          {treatmentProducts.map((product) => (
                            <div
                              key={product._id}
                              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200"
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
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>No treatment products found</p>
                          <p className="text-sm mt-2">Try searching for related products</p>
                        </div>
                      )}
                    </>
                  )}

                  {productTab === 'related' && (
                    <>
                      {suggestedProducts.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                          {suggestedProducts.map((product) => (
                            <div
                              key={product._id}
                              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200"
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
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>No related products found</p>
                          <p className="text-sm mt-2">Try checking treatment products</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Environmental Factors */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <Info className="mr-2" />
                    Environmental Factors
                  </h3>
                </div>
                <div className="p-4">
                  {results[0].info.environmentalFactors?.length > 0 ? (
                    <div className="space-y-3">
                      {results[0].info.environmentalFactors.map((factor, index) => (
                        <div key={index} className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          <span className="text-gray-700">{factor}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <p>No environmental factors available</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
          
          {/* Empty state when no results */}
          {!results && !loading && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full">
              <div className="p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <CloudUpload className="text-gray-400 text-4xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Upload a Video</h3>
                <p className="text-gray-600 mb-6">
                  Upload a video of your crop to detect diseases and get treatment recommendations
                </p>
                <ul className="text-left text-gray-600 space-y-2 mb-6">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span>Get accurate disease identification</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span>View recommended treatments</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span>Find products to treat your crops</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoDiseaseDetection;