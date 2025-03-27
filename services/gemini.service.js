const { GoogleGenerativeAI } = require("@google/generative-ai");
const { systemPrompt, generalSystemPrompt } = require("../config/prompt");

class GeminiService {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error("API key is required");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.generationConfig = {
      temperature: 0.0, // Maximize determinism
      maxOutputTokens: 4000, // Allow full response
      responseMimeType: "application/json", // Critical for structured output
    };
    this.generalConfig = {
      temperature: 0.1, // Slight creativity for technical explanations
      maxOutputTokens: 6000, // Allow longer responses
      topP: 0.95,
      topK: 40,
    };
    this.diseasePrompt = systemPrompt;
    this.generalPrompt = generalSystemPrompt;
  }

  async getDiseaseResponse(userInput) {
    try {
      const model = this.genAI.getGenerativeModel({
        model: "gemini-1.5-pro-latest",
        generationConfig: this.generationConfig,
      });

      const fullPrompt = `${this.diseasePrompt}\n\nQuery: ${userInput}\n\nResponse:`;

      const result = await model.generateContent(fullPrompt);
      const response = await result.response.text();
      
      if (!response) {
        throw new Error("Empty response from Gemini");
      }

      return response;
    } catch (error) {
      console.error("Gemini Disease Service Error:", error);
      throw new Error(`Gemini disease service error: ${error.message}`);
    }
  }

  async getGeneralResponse(userInput) {
    try {
      const model = this.genAI.getGenerativeModel({
        model: "gemini-1.5-pro-latest",
        generationConfig: this.generalConfig,
        systemInstruction: this.generalPrompt,
      });

      const result = await model.generateContent(userInput);
      return await result.response.text();
    } catch (error) {
      throw new Error(`Gemini general service error: ${error.message}`);
    }
  }
}

module.exports = GeminiService;
