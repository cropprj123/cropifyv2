import axios from "axios";
import { useState } from "react";
import ApiLoading from "../../components/ApiLoading";
import { motion } from "framer-motion";
import { Card, Typography, Divider, Alert } from "@mui/joy";

export default function AdvicePrediction() {
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
  const [prediction, setPrediction] = useState({});
  const [got2, setGot2] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputData({
      ...inputData,
      [name]: value,
    });
  };

  const handleSubmitSecond = (e) => {
    e.preventDefault();
    setLoading(true);
    const { N, P, K, temperature, humidity, pH, rainfall } = inputData;
    
    axios
      .get(`/api/v1/crops/predict`, {
        params: {
          data: [N, P, K, temperature, humidity, pH, rainfall].map(parseFloat),
        },
      })
      .then((response) => {
        setPrediction(response.data.prediction);
        setGot2(true);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Prediction Error:", error);
        setLoading(false);
      });
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
        {got2 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold text-gray-900">
                Recommended Crop with Advice
              </h2>
              <motion.div 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="inline-block bg-green-100 rounded-full px-8 py-4 mb-8"
              >
                <p className="text-3xl font-semibold text-green-800">
                  {prediction.prediction}
                </p>
              </motion.div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card 
                  variant="outlined"
                  className="hover:shadow-lg transition-shadow duration-300"
                >
                  <Typography level="h3" className="text-green-700">
                    Nitrogen (N)
                  </Typography>
                  <Divider />
                  <Typography className="text-gray-700 mt-2">
                    {prediction.n_desc}
                  </Typography>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card 
                  variant="outlined"
                  className="hover:shadow-lg transition-shadow duration-300"
                >
                  <Typography level="h3" className="text-blue-700">
                    Phosphorus (P)
                  </Typography>
                  <Divider />
                  <Typography className="text-gray-700 mt-2">
                    {prediction.p_desc}
                  </Typography>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card 
                  variant="outlined"
                  className="hover:shadow-lg transition-shadow duration-300"
                >
                  <Typography level="h3" className="text-purple-700">
                    Potassium (K)
                  </Typography>
                  <Divider />
                  <Typography className="text-gray-700 mt-2">
                    {prediction.k_desc}
                  </Typography>
                </Card>
              </motion.div>
            </div>

            <Alert 
              variant="soft" 
              color="success"
              className="mt-8"
            >
              These recommendations are based on your soil parameters. Consider consulting with a local agricultural expert for more specific advice.
            </Alert>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center space-y-4 mb-12">
              <h1 className="text-4xl font-bold text-gray-900">
                Crop Advice Prediction
              </h1>
              <p className="text-xl text-gray-600">
                Get personalized recommendations for your crop based on soil parameters
              </p>
            </div>

            <form
              onSubmit={handleSubmitSecond}
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
                  Get Advice
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
