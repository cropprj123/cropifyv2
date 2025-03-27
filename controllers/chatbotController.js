const GeminiService = require("../services/gemini.service");

const geminiService = new GeminiService(process.env.GEMINI_API_KEY);

// Disease-specific handler
exports.handleDiseaseQuery = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Invalid message format" });
    }

    const rawResponse = await geminiService.getDiseaseResponse(message);

    // Clean and validate the response
    const cleanedResponse = rawResponse
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    try {
      const parsed = JSON.parse(cleanedResponse);
      
      // Validate required fields
      if (!parsed.type || !parsed.overview) {
        throw new Error("Invalid response format: missing required fields");
      }

      res.json(parsed);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      res.status(500).json({
        error: "Invalid response format",
        details: {
          rawResponse: cleanedResponse,
          parseError: parseError.message
        },
      });
    }
  } catch (error) {
    console.error("Disease Controller Error:", error);
    res.status(500).json({
      error: "Disease query processing failed",
      technicalDetails: error.message,
    });
  }
};

// General agriculture handler with raw text response
exports.handleGeneralQuery = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Invalid message format" });
    }

    const response = await geminiService.getGeneralResponse(message);

    // Return the text response with proper formatting
    res.set("Content-Type", "text/plain");
    res.send(response);
  } catch (error) {
    console.error("General Controller Error:", error);
    res.status(500).json({
      errorType: "AgriculturalProcessingError",
      technicalDetails: {
        errorCode: "AGPROC-502",
        component: "GeneralQueryHandler",
        failedInput: message,
        stackTrace: error.stack.split("\n").slice(0, 5),
      },
      userMessage: "Failed to process agricultural query. Technical team has been alerted.",
    });
  }
};
