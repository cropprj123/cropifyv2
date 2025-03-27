import axios from "axios";
// import { Sidebar } from "keep-react";
import { useState } from "react";
import ApiLoading from "../../components/ApiLoading";
import { Link } from "react-router-dom";
import NewProductCard from "../../components/NewProductCard";
import { motion } from "framer-motion";
import { Card, Typography, Divider, Alert } from "@mui/joy";

import Table from "@mui/joy/Table";
import Sheet from "@mui/joy/Sheet";

export default function FertilizerPrediction({ cart, setCart }) {
  const [loading, setLoading] = useState(false);
  const [inputData, setInputData] = useState({
    temperature: "",
    humidity: "",
    moisture: "",
    soilType: "",
    cropType: "",
    nitrogen: "",
    potassium: "",
    phosphorus: "",
  });
  const [crop, setCrop] = useState("");
  const [fert, setFert] = useState(null);
  const [got, setGot] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Custom validation for soilType
    if (name === "soilType" && (isNaN(value) || value < 0 || value > 4)) {
      return;
    }

    // Custom validation for cropType
    if (name === "cropType" && (isNaN(value) || value < 0 || value > 10)) {
      return;
    }

    setInputData({ ...inputData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const {
      temperature,
      humidity,
      moisture,
      soilType,
      cropType,
      nitrogen,
      potassium,
      phosphorus,
    } = inputData;
    try {
      const response = await axios.get(`/api/v1/crops/predictfertilizer`, {
        params: {
          data: [
            temperature,
            humidity,
            moisture,
            soilType,
            cropType,
            nitrogen,
            potassium,
            phosphorus,
          ].map(parseFloat),
        },
      });
      setCrop(response.data.prediction);

      const searchResponse = await axios.get(
        `/api/v1/crops/search?name=${response.data.prediction[0]}`
      );
      setFert(searchResponse.data.data.crop);
      setGot(true);
    } catch (error) {
      console.error("Prediction Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const inputFields = [
    { name: "temperature", label: "Temperature", unit: "°C" },
    { name: "humidity", label: "Humidity", unit: "%" },
    { name: "moisture", label: "Moisture", unit: "%" },
    { name: "soilType", label: "Soil Type (0-4)", unit: "", help: "0: Black, 1: Clayey, 2: Loamy, 3: Red, 4: Sandy" },
    { name: "cropType", label: "Crop Type (0-10)", unit: "", help: "0: Barley, 1: Cotton, 2: Ground Nuts, 3: Maize, 4: Millets, 5: Oil seeds, 6: Paddy, 7: Pulses, 8: Sugarcane, 9: Tobacco, 10: Wheat" },
    { name: "nitrogen", label: "Nitrogen (N)", unit: "mg/kg" },
    { name: "potassium", label: "Potassium (K)", unit: "mg/kg" },
    { name: "phosphorus", label: "Phosphorus (P)", unit: "mg/kg" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      {loading && <ApiLoading />}
      
      <div className="max-w-7xl mx-auto">
        {got ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold text-gray-900">
                Recommended Fertilizer
              </h2>
              <motion.div 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="inline-block bg-green-100 rounded-full px-8 py-4 mb-8"
              >
                <p className="text-3xl font-semibold text-green-800">
                  {crop}
                </p>
              </motion.div>
            </div>

            {fert && fert.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-800">
                    Available Products
                  </h3>
                  <p className="mt-2 text-gray-600">
                    We found these products that match your requirements
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.isArray(fert) ? (
                    fert.map((product, index) => (
                      <motion.div
                        key={product._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
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
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02 }}
                      className="bg-white rounded-xl shadow-lg overflow-hidden"
                    >
                      <Link to={`/crops/${fert._id}`}>
                        <NewProductCard
                          cart={cart}
                          cropid={fert._id}
                          setCart={setCart}
                          name={fert.name}
                          image={fert.image}
                          type={fert.type}
                          price={fert.price}
                          description={fert.description}
                          quantity={fert.quantity}
                        />
                      </Link>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ) : (
              <Alert 
                variant="soft" 
                color="warning"
                className="mt-8"
              >
                No specific products found for this fertilizer type. Please check back later or contact support for assistance.
              </Alert>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center space-y-4 mb-12">
              <h1 className="text-4xl font-bold text-gray-900">
                Fertilizer Recommendation
              </h1>
              <p className="text-xl text-gray-600">
                Get personalized fertilizer suggestions based on your soil and crop parameters
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {inputFields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <label
                      htmlFor={field.name}
                      className="block text-sm font-medium text-gray-700"
                    >
                      {field.label}
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <input
                        type="number"
                        step="0.01"
                        id={field.name}
                        name={field.name}
                        value={inputData[field.name]}
                        onChange={handleChange}
                        className="block w-full rounded-lg border-gray-300 pl-4 pr-12 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        placeholder="Enter value"
                        required
                      />
                      {field.unit && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="text-gray-500 sm:text-sm">
                            {field.unit}
                          </span>
                        </div>
                      )}
                    </div>
                    {field.help && (
                      <p className="mt-1 text-sm text-gray-500">
                        {field.help}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                >
                  Get Recommendations
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
