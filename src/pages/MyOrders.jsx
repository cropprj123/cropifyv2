import React, { useEffect } from 'react';
import axios from 'axios';

const MyOrders = () => {
  useEffect(() => {
    // Function to extract query parameters from the URL
    const getQueryParams = (url) => {
      const queryParams = {};
      const params = new URLSearchParams(url);
      for (const param of params.entries()) {
        queryParams[param[0]] = param[1];
      }
      return queryParams;
    };

    // Extract event, user, and price from the URL
    const { crop, user, price } = getQueryParams(location.search);

    // Only proceed if we have all required parameters
    if (crop && user && price) {
      // Send a request to your backend to store data in the database
      const storeData = async () => {
        try {
          const response = await axios.get(`/api/v1/bookings/booking`, {
            params: { crop, user, price },
            withCredentials: true // Important for sending cookies
          });
          
          if (response.data.status === 'success') {
            // Redirect to the crops page on success
            window.location.href = "/crops";
          } else {
            console.error("Booking failed:", response.data.message);
          }
        } catch (error) {
          console.error("Error storing data:", error.response?.data?.message || error.message);
          // Handle errors - you might want to show an error message to the user
        }
      };

      // Call the function to store data when the component mounts
      storeData();
    }
  }, [location.search]);

  return (
    <div>
      {/* Render your component content here */}
    </div>
  );
};

export default MyOrders; 