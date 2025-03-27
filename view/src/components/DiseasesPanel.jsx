import React, { useState } from 'react';
import { Leaf } from "lucide-react";

const DiseasesPanel = () => {
    const [isVisible, setIsVisible] = useState(true);

    const diseases = {
        "Tomato": [
            { name: "Septoria leaf spot", samples: 20 },
            { name: "Late blight", samples: 12 },
            { name: "Early blight leaf", samples: 4 },
            { name: "Mosaic virus", samples: 12 },
            { name: "Bacterial spot", samples: 8 },
            { name: "Bacterial spots", samples: 6 },
            { name: "Mold leaf", samples: 3 },
            { name: "Regular leaf", samples: 4 },
            { name: "Multiple leafs", samples: 28 }
        ],
        "Grape": [
            { name: "Black rot", samples: 10 },
            { name: "Regular leaf", samples: 5 }
        ],
        "Corn": [
            { name: "Blight leaf", samples: 10 },
            { name: "Gray leaf spot", samples: 5 }
        ],
        "Potato": [
            { name: "Late Blight", samples: 8 },
            { name: "Regular leaf", samples: 6 }
        ],
        "Apple": [
            { name: "Apple rust leaf", samples: 8 },
            { name: "Regular leaf", samples: 10 },
            { name: "Apple scab leaf", samples: 12 }
        ],
        "Bell pepper": [
            { name: "Regular leaf", samples: 6 },
            { name: "Bell pepper leaf spot", samples: 8 }
        ],
        "Squash": [
            { name: "Powdery mildew leaf", samples: 9 },
            { name: "Regular leaf", samples: 10 }
        ],
        "Raspberry": [
            { name: "Regular leaf", samples: 10 },
            { name: "Raspberry leaf", samples: 10 }
        ],
        "Strawberry": [
            { name: "Regular leaf", samples: 10 },
            { name: "Strawberry leaf", samples: 10 }
        ],
        "Blueberry": [
            { name: "Regular leaf", samples: 10 },
            { name: "Blueberry leaf", samples: 10 }
        ],
        "Peach": [
            { name: "Regular leaf", samples: 10 },
            { name: "Peach leaf", samples: 10 }
        ],
        "Soybean": [
            { name: "Regular leaf", samples: 10 },
            { name: "Soybean leaf", samples: 10 }
        ],
        "Cherry": [
            { name: "Regular leaf", samples: 10 },
            { name: "Cherry leaf", samples: 10 }
        ]
    };

    const togglePanel = () => {
        setIsVisible(!isVisible);
    };

    if (!isVisible) {
        return (
            <button
                onClick={togglePanel}
                className="fixed right-6 top-[5.5rem] z-10 bg-green-600 text-white p-3 rounded-lg shadow-lg hover:bg-green-700 transition-all duration-300 hidden lg:flex items-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                </svg>
                Show Diseases
            </button>
        );
    }

    return (
        <div className="fixed right-6 top-[5.5rem] w-80 bg-white rounded-lg shadow-xl z-10 hidden lg:block">
            <div className="p-4 bg-green-600 text-white rounded-t-lg flex justify-between items-center">
                <h3 className="font-semibold flex items-center gap-2">
                    <Leaf className="w-5 h-5" />
                    Detectable Diseases
                </h3>
                <button 
                    onClick={togglePanel}
                    className="hover:bg-green-700 p-1 rounded transition-colors duration-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
            <div className="max-h-[calc(100vh-10rem)] overflow-y-auto custom-scrollbar">
                {Object.entries(diseases).map(([crop, diseaseList]) => (
                    <div key={crop} className="p-4 border-b border-gray-100">
                        <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            {crop}
                        </h4>
                        <div className="space-y-1">
                            {diseaseList.map((disease, index) => (
                                <div key={index} className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">{disease.name}</span>
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                        {disease.samples} samples
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <style>
                {`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #888;
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #555;
                }
                `}
            </style>
        </div>
    );
};

export default DiseasesPanel;