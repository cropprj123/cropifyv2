import React, { useState, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import useUserData from "../userData";
import { useMediaQuery } from "@material-ui/core";

const NewAdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { userData } = useUserData();
  const isSmallScreen = useMediaQuery("(max-width: 1000px)");

  // Close sidebar by default on small screens
  useEffect(() => {
    if (isSmallScreen) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, [isSmallScreen]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-brown-10">
      {/* Overlay for mobile when sidebar is open */}
      <div
        className={`bg-white shadow-lg text-gray-800 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "w-64" : "w-0 sm:w-16"
        } overflow-hidden`}
      >
        {/* {isSmallScreen && isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={toggleSidebar}
          />
        )} */}

        {/* Sidebar */}
        <div
          //       className={`
          // fixed h-[calc(100vh-64px)] z-40 transition-all duration-300 ease-in-out overflow-hidden
          // ${isSidebarOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"}
          //       ${isSmallScreen ? "w-64" : "w-64 lg:w-72"}
          //       bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          //       shadow-lg
          //        top-16
          //     `}
          className="h-full flex flex-col  bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
               shadow-lg"
        >
          {/* <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-green-600 dark:bg-green-700 text-white">
            <h5 className="text-lg font-semibold flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {!isSmallScreen && "AgroAdmin"}
            </h5>
            {isSmallScreen && (
              <button
                onClick={toggleSidebar}
                className="text-white hover:text-green-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div> */}

          {/* Sidebar Header - only show text when expanded */}
          <div className="py-6 px-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-500 rounded-lg p-2 flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2
                className={`font-bold text-xl whitespace-nowrap text-stone-50 ${
                  isSidebarOpen ? "opacity-100" : "opacity-0 hidden sm:block"
                }`}
              >
                Profile
              </h2>
            </div>
            <div
              className={`mt-6 border-b border-gray-200 ${
                isSidebarOpen ? "block" : "hidden"
              }`}
            ></div>
          </div>

          {/* Sidebar content with custom scrollbar */}
          <div className="flex-1 overflow-y-auto ">
            <nav className="space-y-1 px-2">
              <NavLink
                to=""
                className={({ isActive }) => `
                flex items-center  py-3 rounded-lg  transition-all
                ${
                  isActive
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/30"
                } ${isSidebarOpen ? "px-4" : "px-2 justify-center"}`}
              >
                <div className={`${isSidebarOpen ? "mr-3" : ""}`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                </div>
                <span
                  className={`text-sm ${isSidebarOpen ? "block" : "hidden"}`}
                >
                  Profile
                </span>
              </NavLink>

              {userData?.user?.role === "user" && (
                <NavLink
                  to="/profile/myorders"
                  className={({ isActive }) => `
                  flex items-center w-full p-3 rounded-lg text-start transition-all
                  ${
                    isActive
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/30"
                  }
                `}
                >
                  <div className="grid place-items-center mr-3">
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                      />
                    </svg>
                  </div>
                  <span
                    className={`text-sm ${isSidebarOpen ? "block" : "hidden"}`}
                  >
                    My Orders
                  </span>
                </NavLink>
              )}

              {userData?.user?.role === "admin" && (
                <>
                  <div
                    className={`pt-4 px-4 ${
                      isSidebarOpen ? "block" : "hidden"
                    }`}
                  >
                    <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Dashboard
                    </h5>
                  </div>

                  <NavLink
                    to="/profile/dashboard"
                    className={({ isActive }) => `
                    flex items-center w-full p-3 rounded-lg text-start transition-all
                    ${
                      isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/30"
                    }
                  `}
                  >
                    <div className="grid place-items-center mr-3">
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                        />
                      </svg>
                    </div>
                    Overview Dashboard
                  </NavLink>

                  <div
                    className={`pt-4 px-4 ${
                      isSidebarOpen ? "block" : "hidden"
                    }`}
                  >
                    <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Farm Management
                    </h5>
                  </div>

                  <NavLink
                    to="/profile/createproduct"
                    className={({ isActive }) => `
                    flex items-center w-full p-3 rounded-lg text-start transition-all
                    ${
                      isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/30"
                    }
                  `}
                  >
                    <div className="grid place-items-center mr-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 10.5v6m3-3H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
                        />
                      </svg>
                    </div>
                    Add New Crop
                  </NavLink>

                  <NavLink
                    to="/profile/editcrops"
                    className={({ isActive }) => `
                    flex items-center w-full p-3 rounded-lg text-start transition-all
                    ${
                      isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/30"
                    }
                  `}
                  >
                    <div className="grid place-items-center mr-3">
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                        />
                      </svg>
                    </div>
                    Manage Crops
                  </NavLink>

                  <NavLink
                    to="/profile/createstore"
                    className={({ isActive }) => `
                    flex items-center w-full p-3 rounded-lg text-start transition-all
                    ${
                      isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/30"
                    }
                  `}
                  >
                    <div className="grid place-items-center mr-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z"
                        />
                      </svg>
                    </div>
                    Manage Farmstores
                  </NavLink>

                  <div
                    className={`pt-4 px-4 ${
                      isSidebarOpen ? "block" : "hidden"
                    }`}
                  >
                    <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Orders & Logistics
                    </h5>
                  </div>

                  <NavLink
                    to="/profile/myorders"
                    className={({ isActive }) => `
                    flex items-center w-full p-3 rounded-lg text-start transition-all
                    ${
                      isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/30"
                    }
                  `}
                  >
                    <div className="grid place-items-center mr-3">
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                        />
                      </svg>
                    </div>
                    Order Management
                  </NavLink>

                  <NavLink
                    to="/profile/delivery-management"
                    className={({ isActive }) => `
                    flex items-center w-full p-3 rounded-lg text-start transition-all
                    ${
                      isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/30"
                    }
                  `}
                  >
                    <div className="grid place-items-center mr-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                        />
                      </svg>
                    </div>
                    Delivery Logistics
                  </NavLink>

                  <div
                    className={`pt-4 px-4 ${
                      isSidebarOpen ? "block" : "hidden"
                    }`}
                  >
                    <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Analytics
                    </h5>
                  </div>

                  <NavLink
                    to="/profile/bookingdata"
                    className={({ isActive }) => `
                    flex items-center w-full p-3 rounded-lg text-start transition-all
                    ${
                      isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/30"
                    }
                  `}
                  >
                    <div className="grid place-items-center mr-3">
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                        />
                      </svg>
                    </div>
                    Sales Analytics
                  </NavLink>

                  {/* <NavLink
                  to="/profile/statistics"
                  className={({ isActive }) => `
                    flex items-center w-full p-3 rounded-lg text-start transition-all
                    ${
                      isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/30"
                    }
                  `}
                >
                  <div className="grid place-items-center mr-3">
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z"
                      />
                    </svg>
                  </div>
                  Crop Reports
                </NavLink> */}

                  <NavLink
                    to="/profile/mostpop"
                    className={({ isActive }) => `
                    flex items-center w-full p-3 rounded-lg text-start transition-all
                    ${
                      isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/30"
                    }
                  `}
                  >
                    <div className="grid place-items-center mr-3">
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                        />
                      </svg>
                    </div>
                    Customer Feedback
                  </NavLink>
                </>
              )}
            </nav>
          </div>
        </div>
      </div>
      {/* Main Content */}
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
          <h2 className="font-medium">Profile</h2>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto  hide-scrollbar p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default NewAdminLayout;
