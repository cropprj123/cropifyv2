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
  const [fert, setFert] = useState(null);

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
      const response = await axios.get(`/api/v1/crops/singlecrop`, {
        params: {
          data: [N, P, K, temperature, humidity, pH, rainfall].map(parseFloat),
        },
      });
      // Extract the prediction from the response and do something with it
      //console.log("Prediction:", response.data.prediction.prediction);

      setCrop(response.data.prediction.prediction);

      // Fire the search after the prediction arrives
      const searchResponse = await axios.get(
        `/api/v1/crops/search?name=${response.data.prediction.prediction[0]}`
      );
      //console.log("Search response: ", searchResponse.data.data.crop);
      setFert(searchResponse.data.data.crop);

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
        {got ? (
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
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center space-y-4 mb-12">
              <h1 className="text-4xl font-bold text-gray-900">
                Crop Recommendation
              </h1>
              <p className="text-xl text-gray-600">
                Enter your soil and environmental parameters to get personalized crop recommendations
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
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-gray-500 sm:text-sm">
                          {field.unit}
                        </span>
                      </div>
                    </div>
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
                  Get Recommendation
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
