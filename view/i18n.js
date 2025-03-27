import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Translation resources for different languages
const resources = {
  en: {
    translation: {
      Nitrogen: "Nitrogen",
      Phosphorus: "Phosphorus",
      Potassium: "Potassium",
      // Add more translations as needed
    },
  },
  hi: {
    translation: {
      Nitrogen: "नाइट्रोजन",
      Phosphorus: "फॉस्फोरस",
      Potassium: "पोटेशियम",
      // Add more translations as needed
    },
  },
  mr: {
    translation: {
      Nitrogen: "नायट्रोजन",
      Phosphorus: "फॉस्फरस",
      Potassium: "पोटॅशियम",
      // Add more translations as needed
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en", // Default language
  fallbackLng: "en", // Fallback language
  interpolation: {
    escapeValue: false, // React already does escaping
  },
});

export default i18n;
