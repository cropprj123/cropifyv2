// const express = require("express");
// const router = express.Router();
// const multer = require("multer");
// const path = require("path");

// const { convertSpeechToText } = require("../controllers/speechToTextController");

// // Configure multer for video upload
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'uploads/videos');
//     },
//     filename: function (req, file, cb) {
//         cb(null, Date.now() + path.extname(file.originalname));
//     }
// });

// const upload = multer({
//     storage: storage,
//     fileFilter: (req, file, cb) => {
//         const allowedTypes = /mp4|avi|mov|wmv|flv|mkv/;
//         const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        
//         if (extname) {
//             return cb(null, true);
//         }
//         cb(new Error('Only video files (mp4, avi, mov, wmv, flv, mkv) are allowed!'));
//     },
//     limits: {
//         fileSize: 100 * 1024 * 1024 // 100MB max file size
//     }
// }).single('video');

// router.post("/convert", (req, res) => {
//     upload(req, res, function(err) {
//         if (err instanceof multer.MulterError) {
//             return res.status(400).json({
//                 success: false,
//                 message: "File upload error: " + err.message
//             });
//         } else if (err) {
//             return res.status(400).json({
//                 success: false,
//                 message: err.message
//             });
//         }
        
//         // If file upload is successful, proceed with conversion
//         convertSpeechToText(req, res);
//     });
// });

// module.exports = router; 
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const { convertSpeechToText } = require("../controllers/speechToTextController");

// Configure multer for video upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/videos');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /mp4|avi|mov|wmv|flv|mkv/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        
        if (extname) {
            return cb(null, true);
        }
        cb(new Error('Only video files (mp4, avi, mov, wmv, flv, mkv) are allowed!'));
    },
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB max file size
    }
}).single('video');

router.post("/convert", (req, res) => {
    upload(req, res, function(err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                success: false,
                message: "File upload error: " + err.message
            });
        } else if (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }
        
        // If file upload is successful, proceed with conversion
        convertSpeechToText(req, res);
    });
});

module.exports = router;