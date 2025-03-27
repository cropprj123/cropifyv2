import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from "framer-motion";
import useUserData from "../../components/userData";

export default function FarmerLocationPrediction() {
  const { userData } = useUserData();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [cropDisease, setCropDisease] = useState('');
  const [submitStatus, setSubmitStatus] = useState(null);

  // Get user's location when component mounts
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            type: "Point",
            coordinates: [position.coords.longitude, position.coords.latitude]
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setError("Failed to get location. Please enable location services.");
        }
      );
    } else {
      setError("Geolocation is not supported by your browser");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!location) {
      setError("Location is required. Please enable location services.");
      setLoading(false);
      return;
    }

    if (!cropDisease) {
      setError("Please enter the crop disease name");
      setLoading(false);
      return;
    }

    try {
      const data = {
        userId: userData.user._id,
        userName: userData.user.name,
        cropDiseaseName: cropDisease,
        geolocation: location
      };

      const response = await axios.post('http://127.0.0.1:3001/api/v1/crops/farmer-location', data);
      console.log('API Response:', response.data);
      setSubmitStatus('Success! Location and crop disease information saved.');
      setCropDisease(''); // Reset the input
    } catch (error) {
      console.error('Submission Error:', error);
      setError(error.response?.data?.message || 'Failed to submit data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Report Crop Disease Location
          </h2>

          {/* Location Status */}
          <div className="mb-6">
            <p className="text-gray-600">
              Location Status: {location ? '✅ Location detected' : '⏳ Detecting location...'}
            </p>
            {location && (
              <p className="text-sm text-gray-500 mt-2">
                Coordinates: {location.coordinates[1].toFixed(6)}, {location.coordinates[0].toFixed(6)}
              </p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="cropDisease" className="block text-sm font-medium text-gray-700">
                Crop Disease Name
              </label>
              <input
                type="text"
                id="cropDisease"
                value={cropDisease}
                onChange={(e) => setCropDisease(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Enter crop disease name"
              />
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading || !location}
                className={`px-6 py-3 rounded-lg text-white font-medium transition-all duration-300 ${
                  loading || !location
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 hover:shadow-lg transform hover:-translate-y-1'
                }`}
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg"
            >
              {error}
            </motion.div>
          )}

          {/* Success Message */}
          {submitStatus && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-4 bg-green-100 text-green-700 rounded-lg"
            >
              {submitStatus}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
} 