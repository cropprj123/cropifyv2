import React, { useEffect, useState } from "react";
import Chart from "chart.js/auto";
import Typography from "@mui/joy/Typography";
import { Button } from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import StarIcon from '@mui/icons-material/Star';
import RateReviewIcon from '@mui/icons-material/RateReview';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

export default function MostPopular() {
  const [productReviews, setProductReviews] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    highestRatedProduct: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:5173/api/v1/reviews/`);
        const data = await response.json();
        setProductReviews(data.data.data);

        // Calculate summary statistics
        const totalReviews = data.data.data.length;
        const avgRating = data.data.data.reduce((acc, review) => acc + review.rating, 0) / totalReviews;
        
        // Find highest rated product
        const productRatings = {};
        data.data.data.forEach(review => {
          if (!productRatings[review.crop.name]) {
            productRatings[review.crop.name] = { total: review.rating, count: 1 };
          } else {
            productRatings[review.crop.name].total += review.rating;
            productRatings[review.crop.name].count += 1;
          }
        });

        let highestRated = { name: '', rating: 0 };
        Object.entries(productRatings).forEach(([name, stats]) => {
          const avgProductRating = stats.total / stats.count;
          if (avgProductRating > highestRated.rating) {
            highestRated = { name, rating: avgProductRating };
          }
        });

        setSummaryStats({
          totalReviews,
          averageRating: avgRating,
          highestRatedProduct: highestRated.name,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleDownloadExcel = async () => {
    try {
      const response = await fetch("http://127.0.0.1:3000/api/v1/bookings/report");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "bookingsdata.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Error downloading Excel:", error);
    }
  };

  useEffect(() => {
    if (productReviews.length === 0) return;

    const cropData = {};

    productReviews.forEach((review) => {
      const cropName = review.crop.name;
      const rating = review.rating;

      if (!cropData[cropName]) {
        cropData[cropName] = { numRatings: 1, totalRating: rating };
      } else {
        cropData[cropName].numRatings++;
        cropData[cropName].totalRating += rating;
      }
    });

    const cropNames = Object.keys(cropData);
    const avgRatings = cropNames.map((cropName) => {
      const { numRatings, totalRating } = cropData[cropName];
      return (totalRating / numRatings).toFixed(1);
    });

    const ctx = document.getElementById("product-rating-chart").getContext("2d");

    const newChartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: cropNames,
        datasets: [
          {
            label: "Number of Ratings",
            data: cropNames.map((cropName) => cropData[cropName].numRatings),
            backgroundColor: "rgba(99, 102, 241, 0.5)",
            borderColor: "rgba(99, 102, 241, 1)",
            borderWidth: 1,
            borderRadius: 5,
          },
          {
            label: "Average Rating",
            data: avgRatings,
            backgroundColor: "rgba(34, 197, 94, 0.5)",
            borderColor: "rgba(34, 197, 94, 1)",
            borderWidth: 1,
            borderRadius: 5,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(0, 0, 0, 0.1)",
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            labels: {
              usePointStyle: true,
              padding: 20,
            },
          },
          title: {
            display: true,
            text: "Product Ratings Overview",
            font: {
              size: 16,
            },
            padding: {
              top: 10,
              bottom: 30,
            },
          },
        },
      },
    });

    return () => newChartInstance.destroy();
  }, [productReviews]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Typography level="h2" className="text-2xl font-bold">
          Reviews and Ratings Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleDownloadExcel}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          Download Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <RateReviewIcon className="text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Reviews</p>
              <p className="text-xl font-semibold">{summaryStats.totalReviews}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <StarIcon className="text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Average Rating</p>
              <p className="text-xl font-semibold">{summaryStats.averageRating.toFixed(1)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUpIcon className="text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Highest Rated Product</p>
              <p className="text-xl font-semibold">{summaryStats.highestRatedProduct}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="h-[500px]">
          <canvas id="product-rating-chart"></canvas>
        </div>
      </div>
    </div>
  );
}
