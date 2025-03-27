const mongoose = require("mongoose");

function arrayNotEmpty(val) {
  return Array.isArray(val) && val.length > 0;
}

const DiseaseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Disease name is required."],
      unique: true,
      trim: true,
    },
    cropAffected: {
      type: String,
      required: [true, "Affected crop is required."],
      trim: true,
    },
    scientificName: {
      type: String,
      default: "",
      trim: true,
    },

    detailedDescription: {
      type: String,
      required: [true, "A detailed description is required."],
      trim: true,
    },

    // Detailed Descriptions
    symptoms: {
      type: [String],
      required: [true, "At least one symptom is required."],
      validate: {
        validator: arrayNotEmpty,
        message: "Symptoms array cannot be empty.",
      },
    },
    causes: {
      type: [String],
      required: [true, "At least one cause is required."],
      validate: {
        validator: arrayNotEmpty,
        message: "Causes array cannot be empty.",
      },
    },
    prevention: {
      type: [String],
      required: [true, "At least one prevention technique is required."],
      validate: {
        validator: arrayNotEmpty,
        message: "Prevention techniques array cannot be empty.",
      },
    },

    // Treatment Options
    treatment: {
      chemical: {
        type: [String],
        default: [],
      },
      organic: {
        type: [String],
        default: [],
      },
      cultural: {
        type: [String],
        default: [],
      },
    },

    // Recommended products (only product names)
    recommendedProducts: {
      type: [String],
      default: [],
    },

    // Conditions that favor the spread of the disease
    spreadingConditions: {
      type: [String],
      default: [],
    },
  },
  {
    // Automatically manage createdAt and updatedAt fields
    timestamps: true,
  }
);

module.exports = mongoose.model("Disease", DiseaseSchema);
