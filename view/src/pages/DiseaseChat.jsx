import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane, FaBug, FaRobot, FaUser, FaInfoCircle, FaLeaf, FaFlask, FaSyringe, FaShieldAlt, FaChartLine } from 'react-icons/fa';

const DiseaseChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [error, setError] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/v1/ai/chat', {
        message: userMessage
      });

      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: response.data.overview,
        diseaseInfo: response.data
      }]);
    } catch (err) {
      setError('Failed to get response. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderDiseaseInfo = (info) => {
    if (!info) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 bg-white rounded-xl shadow-lg overflow-hidden"
      >
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overview Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-green-600">
                <FaInfoCircle className="text-xl" />
                <h3 className="text-xl font-semibold">Overview</h3>
              </div>
              <p className="text-gray-700">{info.overview}</p>
              <div>
                <h4 className="font-medium text-gray-800">Scientific Name</h4>
                <p className="text-gray-600 text-sm">{info.scientificName}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Pathogen Classification</h4>
                <ul className="list-disc list-inside text-gray-600 text-sm">
                  {Object.entries(info.pathogenClassification).map(([key, value]) => (
                    <li key={key}>{key.charAt(0).toUpperCase() + key.slice(1)}: {value}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Symptoms Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-red-600">
                <FaBug className="text-xl" />
                <h3 className="text-xl font-semibold">Symptoms</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <h4 className="font-medium text-gray-800">Early Symptoms</h4>
                  <p className="text-gray-600 text-sm">{info.symptoms.earlySymptoms}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Progressive Symptoms</h4>
                  <p className="text-gray-600 text-sm">{info.symptoms.progressiveSymptoms}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Advanced Symptoms</h4>
                  <p className="text-gray-600 text-sm">{info.symptoms.advancedSymptoms}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Differential Diagnosis</h4>
                  <p className="text-gray-600 text-sm">{info.symptoms.differentialDiagnosis}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Diagnostic Techniques</h4>
                  <ul className="list-disc list-inside text-gray-600 text-sm">
                    {Object.entries(info.symptoms.diagnosticTechniques).map(([key, value]) => (
                      <li key={key}>{key.charAt(0).toUpperCase() + key.slice(1)}: {value}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Treatment Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-blue-600">
                <FaSyringe className="text-xl" />
                <h3 className="text-xl font-semibold">Treatment</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <h4 className="font-medium text-gray-800">Chemical Control</h4>
                  <ul className="list-disc list-inside text-gray-600 text-sm">
                    {Object.entries(info.treatment.chemicalControl).map(([key, value]) => (
                      <li key={key}>
                        <span className="font-medium">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                        {Array.isArray(value) ? (
                          <ul className="list-disc list-inside ml-4">
                            {value.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="ml-2">{value}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Biological Control</h4>
                  <ul className="list-disc list-inside text-gray-600 text-sm">
                    {Object.entries(info.treatment.biologicalControl).map(([key, value]) => (
                      <li key={key}>
                        <span className="font-medium">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                        {Array.isArray(value) ? (
                          <ul className="list-disc list-inside ml-4">
                            {value.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="ml-2">{value}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Integrated Management</h4>
                  <p className="text-gray-600 text-sm">{info.treatment.integratedManagement}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Post-Infection Strategies</h4>
                  <p className="text-gray-600 text-sm">{info.treatment.postInfectionStrategies}</p>
                </div>
              </div>
            </div>

            {/* Prevention Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-purple-600">
                <FaShieldAlt className="text-xl" />
                <h3 className="text-xl font-semibold">Prevention</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <h4 className="font-medium text-gray-800">Resistant Cultivars</h4>
                  <ul className="list-disc list-inside text-gray-600 text-sm">
                    {info.prevention.resistantCultivars.map((cultivar, index) => (
                      <li key={index}>{cultivar}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Cultural Practices</h4>
                  <ul className="list-disc list-inside text-gray-600 text-sm">
                    {info.prevention.culturalPractices.map((practice, index) => (
                      <li key={index}>{practice}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Prophylactic Treatments</h4>
                  <ul className="list-disc list-inside text-gray-600 text-sm">
                    {info.prevention.prophylacticTreatments.map((treatment, index) => (
                      <li key={index}>{treatment}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Crop Rotation</h4>
                  <p className="text-gray-600 text-sm">{info.prevention.cropRotation}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Sanitation Protocols</h4>
                  <p className="text-gray-600 text-sm">{info.prevention.sanitationProtocols}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Environmental Modification</h4>
                  <p className="text-gray-600 text-sm">{info.prevention.environmentalModification}</p>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4 md:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Etiology Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-indigo-600">
                    <FaFlask className="text-xl" />
                    <h3 className="text-xl font-semibold">Etiology</h3>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <h4 className="font-medium text-gray-800">Pathogen Biology</h4>
                      <p className="text-gray-600 text-sm">{info.etiology.pathogenBiology}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">Infection Process</h4>
                      <p className="text-gray-600 text-sm">{info.etiology.infectionProcess}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">Environmental Factors</h4>
                      <ul className="list-disc list-inside text-gray-600 text-sm">
                        {Object.entries(info.etiology.environmentalFactors).map(([key, value]) => (
                          <li key={key}>{key.charAt(0).toUpperCase() + key.slice(1)}: {value}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">Transmission Mechanisms</h4>
                      <p className="text-gray-600 text-sm">{info.etiology.transmissionMechanisms}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">Survivability</h4>
                      <p className="text-gray-600 text-sm">{info.etiology.survivability}</p>
                    </div>
                  </div>
                </div>

                {/* Histopathology Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-orange-600">
                    <FaChartLine className="text-xl" />
                    <h3 className="text-xl font-semibold">Histopathology</h3>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <h4 className="font-medium text-gray-800">Cellular Changes</h4>
                      <p className="text-gray-600 text-sm">{info.histopathology.cellularChanges}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">Tissue Effects</h4>
                      <p className="text-gray-600 text-sm">{info.histopathology.tissueEffects}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">Physiological Impact</h4>
                      <ul className="list-disc list-inside text-gray-600 text-sm">
                        {Object.entries(info.histopathology.physiologicalImpact).map(([key, value]) => (
                          <li key={key}>{key.charAt(0).toUpperCase() + key.slice(1)}: {value}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Recommendations */}
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center space-x-2 text-teal-600">
                <FaLeaf className="text-xl" />
                <h3 className="text-xl font-semibold">Product Recommendations</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {info.productRecommendations.map((product, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800">{product.productName}</h4>
                    <ul className="mt-2 space-y-1 text-gray-600 text-sm">
                      <li><span className="font-medium">Active Ingredient:</span> {product.activeIngredient}</li>
                      <li><span className="font-medium">Mode of Action:</span> {product.modeOfAction}</li>
                      <li><span className="font-medium">Application Rate:</span> {product.applicationRate}</li>
                      <li><span className="font-medium">Application Timing:</span> {product.applicationTiming}</li>
                      <li><span className="font-medium">Safety Information:</span> {product.safetyInformation}</li>
                      <li><span className="font-medium">Compatibilities:</span> {product.compatibilities}</li>
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Scientific Research */}
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center space-x-2 text-cyan-600">
                <FaFlask className="text-xl" />
                <h3 className="text-xl font-semibold">Scientific Research</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-800">Recent Findings</h4>
                  <p className="text-gray-600 text-sm">{info.scientificResearch.recentFindings}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Emerging Treatments</h4>
                  <p className="text-gray-600 text-sm">{info.scientificResearch.emergingTreatments}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Genetic Approaches</h4>
                  <p className="text-gray-600 text-sm">{info.scientificResearch.geneticApproaches}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Climate Change Implications</h4>
                  <p className="text-gray-600 text-sm">{info.scientificResearch.climateChangeImplications}</p>
                </div>
              </div>
            </div>

            {/* Regional Considerations */}
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center space-x-2 text-yellow-600">
                <FaChartLine className="text-xl" />
                <h3 className="text-xl font-semibold">Regional Considerations</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(info.regionalConsiderations).map(([region, details]) => (
                  <div key={region} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800">{region.replace(/([A-Z])/g, ' $1').trim()}</h4>
                    <p className="text-gray-600 text-sm mt-2">{details}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Organic Management */}
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center space-x-2 text-emerald-600">
                <FaLeaf className="text-xl" />
                <h3 className="text-xl font-semibold">Organic Management</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-800">Certified Treatments</h4>
                  <ul className="list-disc list-inside text-gray-600 text-sm">
                    {info.organicManagement.certifiedTreatments.map((treatment, index) => (
                      <li key={index}>{treatment}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Cultural Approaches</h4>
                  <ul className="list-disc list-inside text-gray-600 text-sm">
                    {info.organicManagement.culturalApproaches.map((approach, index) => (
                      <li key={index}>{approach}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Biological Options</h4>
                  <ul className="list-disc list-inside text-gray-600 text-sm">
                    {info.organicManagement.biologicalOptions.map((option, index) => (
                      <li key={index}>{option}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* References */}
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center space-x-2 text-gray-600">
                <FaInfoCircle className="text-xl" />
                <h3 className="text-xl font-semibold">References</h3>
              </div>
              <ul className="list-disc list-inside text-gray-600 text-sm">
                {info.references.map((reference, index) => (
                  <li key={index}>{reference}</li>
                ))}
              </ul>
            </div>

            {/* Additional Information */}
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center space-x-2 text-gray-600">
                <FaInfoCircle className="text-xl" />
                <h3 className="text-xl font-semibold">Additional Information</h3>
              </div>
              <p className="text-gray-600 text-sm">{info.additionalInformation}</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="p-6 md:p-8">
            <div className="flex items-center space-x-4 mb-8">
              <div className="bg-red-100 p-3 rounded-full">
                <FaBug className="text-2xl text-red-600" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Crop Disease Assistant</h2>
                <p className="text-gray-600 mt-1">
                  Get instant help with crop disease identification and treatment
                </p>
              </div>
            </div>

            <div className="h-[600px] overflow-y-auto mb-6 p-4 bg-gray-50 rounded-xl">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                  >
                    <div className={`flex items-start space-x-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className={`p-3 rounded-full ${message.type === 'user' ? 'bg-blue-100' : 'bg-red-100'}`}>
                        {message.type === 'user' ? (
                          <FaUser className="text-blue-600" />
                        ) : (
                          <FaRobot className="text-red-600" />
                        )}
                      </div>
                      <div className={`rounded-2xl p-4 ${message.type === 'user' ? 'bg-blue-600 text-white' : 'bg-white shadow-sm'}`}>
                        <p className="text-sm md:text-base">{message.content}</p>
                        {message.diseaseInfo && renderDiseaseInfo(message.diseaseInfo)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-lg"
              >
                <p className="text-sm text-red-700">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="flex space-x-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about crop diseases, symptoms, or treatments..."
                className="flex-1 rounded-xl border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                disabled={loading}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 shadow-lg flex items-center space-x-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send</span>
                    <FaPaperPlane />
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DiseaseChat; 