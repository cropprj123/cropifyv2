import axios from "axios";
// import { Sidebar } from "keep-react";
import { useState } from "react";
import ApiLoading from "../../components/ApiLoading";
import NewProductCard from "../../components/NewProductCard";
import { Link } from "react-router-dom";
import { Typography } from "@mui/material";
import { motion } from "framer-motion";

export default function CropPrediction({ cart, setCart }) {
  const [loading, setLoading] = useState(false);
  const [inputData, setInputData] = useState({
    N: "",
    P: "",
    K: "",
    temperature: "",
    humidity: "",
    pH: "",
    rainfall: "",
  });
  const [crop, setCrop] = useState("");
  const [got, setGot] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [fert, setFert] = useState(null);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputData({
      ...inputData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { N, P, K, temperature, humidity, pH, rainfall } = inputData;
    
    try {
      // Only add language parameter if it's not English
      const endpoint = selectedLanguage === 'en'
        ? '/api/v1/crops/infopredict'
        : `/api/v1/crops/infopredict?lang=${selectedLanguage}`;

      const response = await axios.get(endpoint, {
        params: {
          data: [N, P, K, temperature, humidity, pH, rainfall].map(parseFloat)
        },
      });
      
      setCrop(response.data);
      setGot(true);
    } catch (error) {
      console.error("Prediction Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const inputFields = [
    { name: "N", label: "Nitrogen (N)", unit: "mg/kg" },
    { name: "P", label: "Phosphorus (P)", unit: "mg/kg" },
    { name: "K", label: "Potassium (K)", unit: "mg/kg" },
    { name: "temperature", label: "Temperature", unit: "°C" },
    { name: "humidity", label: "Humidity", unit: "%" },
    { name: "pH", label: "pH Level", unit: "pH" },
    { name: "rainfall", label: "Rainfall", unit: "mm" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      {loading && <ApiLoading />}
      
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Soil Analysis</h2>

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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {inputFields.map((field) => (
                <div key={field.name}>
                  <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
                    {field.label} {field.unit && `(${field.unit})`}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name={field.name}
                    id={field.name}
                    value={inputData[field.name]}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                  {field.help && (
                    <p className="mt-1 text-sm text-gray-500">{field.help}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 rounded-lg text-white font-medium transition-all duration-300 ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 hover:shadow-lg transform hover:-translate-y-1'
                }`}
              >
                {loading ? 'Analyzing...' : 'Analyze Soil'}
              </button>
            </div>
          </form>
        </div>

        {/* Results Section */}
        {got && crop && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold text-gray-900">
                Recommended Crop
              </h2>
              <div className="inline-block bg-green-100 rounded-full px-6 py-3">
                <p className="text-2xl font-semibold text-green-800">
                  {crop}
                </p>
              </div>
            </div>

            {fert && fert.length > 0 ? (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-800">
                    Recommended Products
                  </h3>
                  <p className="mt-2 text-gray-600">
                    These products are perfect for your crop
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {fert.map((product) => (
                    <motion.div
                      key={product._id}
                      whileHover={{ scale: 1.02 }}
                      className="bg-white rounded-xl shadow-lg overflow-hidden"
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
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center p-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600">
                  No specific products found for this crop type.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
