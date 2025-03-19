import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

const PredictionLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar - no longer fixed/absolute positioned */}
      <div
        className={`bg-white shadow-lg text-gray-800 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "w-64" : "w-0 sm:w-16"
        } overflow-hidden`}
      >
        {/* Sidebar Content */}
        <div className="h-full flex flex-col">
          {/* Sidebar Header - only show text when expanded */}
          <div className="py-6 px-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-500 rounded-lg p-2 flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h2
                className={`font-bold text-xl whitespace-nowrap ${
                  isSidebarOpen ? "opacity-100" : "opacity-0 hidden sm:block"
                }`}
              >
                FarmAssist
              </h2>
            </div>
            <div
              className={`mt-6 border-b border-gray-200 ${
                isSidebarOpen ? "block" : "hidden"
              }`}
            ></div>
          </div>

          {/* Navigation - Full and Collapsed states */}
          <div className="flex-1 overflow-y-auto">
            {/* Navigation Links */}
            <nav className="space-y-1 px-2">
              <NavLink
                to="/prediction/disease"
                className={({ isActive }) =>
                  `flex items-center py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-green-50 text-green-700 font-medium"
                      : "text-gray-700 hover:bg-green-50 hover:text-green-700"
                  } ${isSidebarOpen ? "px-4" : "px-2 justify-center"}`
                }
              >
                <div className={`${isSidebarOpen ? "mr-3" : ""}`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <span
                  className={`text-sm ${isSidebarOpen ? "block" : "hidden"}`}
                >
                  Disease Prediction
                </span>
              </NavLink>

              <NavLink
                to="/prediction/video"
                className={({ isActive }) =>
                  `flex items-center py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-green-50 text-green-700 font-medium"
                      : "text-gray-700 hover:bg-green-50 hover:text-green-700"
                  } ${isSidebarOpen ? "px-4" : "px-2 justify-center"}`
                }
              >
                <div className={`${isSidebarOpen ? "mr-3" : ""}`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <span
                  className={`text-sm ${isSidebarOpen ? "block" : "hidden"}`}
                >
                  Video Detection
                </span>
              </NavLink>

              <NavLink
                to="/prediction/crop"
                className={({ isActive }) =>
                  `flex items-center py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-green-50 text-green-700 font-medium"
                      : "text-gray-700 hover:bg-green-50 hover:text-green-700"
                  } ${isSidebarOpen ? "px-4" : "px-2 justify-center"}`
                }
              >
                <div className={`${isSidebarOpen ? "mr-3" : ""}`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                    />
                  </svg>
                </div>
                <span
                  className={`text-sm ${isSidebarOpen ? "block" : "hidden"}`}
                >
                  Get Crop
                </span>
              </NavLink>

              <div
                className={`mt-4 border-b border-gray-200 ${
                  isSidebarOpen ? "block" : "hidden"
                }`}
              ></div>

              {/* Section title - only show when expanded */}
              <div
                className={`pt-4 px-4 ${isSidebarOpen ? "block" : "hidden"}`}
              >
                <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  ADVISORY TOOLS
                </h5>
              </div>

              <NavLink
                to="/prediction/advice"
                className={({ isActive }) =>
                  `flex items-center py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-green-50 text-green-700 font-medium"
                      : "text-gray-700 hover:bg-green-50 hover:text-green-700"
                  } ${isSidebarOpen ? "px-4" : "px-2 justify-center"}`
                }
              >
                <div className={`${isSidebarOpen ? "mr-3" : ""}`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <span
                  className={`text-sm ${isSidebarOpen ? "block" : "hidden"}`}
                >
                  Crop Advice
                </span>
              </NavLink>

              <NavLink
                to="/prediction/fertilizer"
                className={({ isActive }) =>
                  `flex items-center py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-green-50 text-green-700 font-medium"
                      : "text-gray-700 hover:bg-green-50 hover:text-green-700"
                  } ${isSidebarOpen ? "px-4" : "px-2 justify-center"}`
                }
              >
                <div className={`${isSidebarOpen ? "mr-3" : ""}`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                    />
                  </svg>
                </div>
                <span
                  className={`text-sm ${isSidebarOpen ? "block" : "hidden"}`}
                >
                  Fertilizer
                </span>
              </NavLink>

              <div
                className={`mt-4 border-b border-gray-200 ${
                  isSidebarOpen ? "block" : "hidden"
                }`}
              ></div>

              {/* Section title - only show when expanded */}
              {/* <div
                className={`pt-4 px-4 ${isSidebarOpen ? "block" : "hidden"}`}
              >
                <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  ANALYTICS
                </h5>
              </div>

              <NavLink
                to="/prediction/models"
                className={({ isActive }) =>
                  `flex items-center py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-green-50 text-green-700 font-medium"
                      : "text-gray-700 hover:bg-green-50 hover:text-green-700"
                  } ${isSidebarOpen ? "px-4" : "px-2 justify-center"}`
                }
              >
                <div className={`${isSidebarOpen ? "mr-3" : ""}`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <span
                  className={`text-sm ${isSidebarOpen ? "block" : "hidden"}`}
                >
                  Model Comparisons
                </span>
              </NavLink> */}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toggle button integrated into content area */}
        <div className="bg-white shadow-sm p-4 flex items-center">
          <button
            onClick={toggleSidebar}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 mr-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h2 className="font-medium">Prediction Tools</h2>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto  hide-scrollbar p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default PredictionLayout;
