const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

exports.convertSpeechToText = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "Please upload a video file"
        });
    }

    try {
        // Create form data for the Python service
        const formData = new FormData();
        formData.append('video', fs.createReadStream(req.file.path), {
            filename: req.file.originalname,
            contentType: req.file.mimetype
        });

        // Send to Python service
        const response = await axios.post(
            `${process.env.FLASK_SERVER_URL}/api/speech-to-text`,
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            }
        );

        // Clean up the temporary file
        fs.unlinkSync(req.file.path);

        // Return the transcription results
        res.status(200).json({
            success: true,
            transcription: response.data
        });

    } catch (error) {
        console.error('Speech to Text Error:', error);
        
        // Clean up the temporary file in case of error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            success: false,
            message: error.response?.data?.error || "Error processing video"
        });
    }
}; 