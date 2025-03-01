import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Button,
  Select,
  Option,
  Divider,
  CircularProgress,
  Table,
  Sheet
} from '@mui/joy';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import axios from 'axios';

const StatCard = ({ title, value, subValue, icon, trend }) => (
  <Card variant="outlined" sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography level="body-sm" sx={{ mb: 1 }}>{title}</Typography>
          <Typography level="h3">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </Typography>
          {subValue && (
            <Typography level="body-sm" color={trend === 'up' ? 'success' : 'danger'}>
              {trend === 'up' ? '↑' : '↓'} {subValue}
            </Typography>
          )}
        </Box>
        <Box sx={{ 
          p: 1, 
          borderRadius: '50%', 
          bgcolor: 'background.level2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const DeliveryStatusCard = ({ status, count, total, color }) => (
  <Card variant="outlined" sx={{ height: '100%' }}>
    <CardContent>
      <Typography level="body-sm" sx={{ mb: 1 }}>{status}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography level="h3">{count}</Typography>
        <Typography level="body-sm">({((count / total) * 100).toFixed(1)}%)</Typography>
      </Box>
      <Box sx={{ mt: 2, height: 4, bgcolor: 'background.level2', borderRadius: 2 }}>
        <Box 
          sx={{ 
            width: `${(count / total) * 100}%`, 
            height: '100%', 
            bgcolor: color,
            borderRadius: 2
          }} 
        />
      </Box>
    </CardContent>
  </Card>
);

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    avgRevenue: 0,
    deliveryStatusCounts: {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0
    },
    revenueByCrop: {},
    bookingsByDate: {},
    recentBookings: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('/api/v1/bookings/admin-dashboard', {
          params: { timeRange }
        });
        
        if (response.data && response.data.data) {
          setDashboardData(response.data.data);
        } else {
          throw new Error('Invalid data format received from server');
        }
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        // Don't set error for 404, just use empty state
        if (err.response?.status !== 404) {
          setError(err.message || 'Failed to fetch dashboard data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [timeRange]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography level="h4" color="danger">Error: {error}</Typography>
        <Button 
          onClick={() => window.location.reload()} 
          sx={{ mt: 2 }}
          variant="soft"
        >
          Retry
        </Button>
      </Box>
    );
  }

  const {
    totalRevenue = 0,
    totalBookings = 0,
    avgRevenue = 0,
    deliveryStatusCounts = {},
    revenueByCrop = {},
    bookingsByDate = {},
    recentBookings = []
  } = dashboardData;

  // Sort dates for the chart
  const sortedDates = Object.entries(bookingsByDate)
    .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB));

  // Prepare data for charts
  const revenueChartData = {
    labels: sortedDates.map(([date]) => {
      const d = new Date(date);
      return d.toLocaleDateString('en-GB', { 
        day: 'numeric',
        month: 'short'
      });
    }),
    datasets: [{
      label: 'Number of Orders',
      data: sortedDates.map(([_, count]) => count),
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  };

  const cropRevenueData = {
    labels: Object.keys(revenueByCrop),
    datasets: [{
      data: Object.values(revenueByCrop),
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF'
      ]
    }]
  };

  // Add a message when no bookings are found
  const NoDataMessage = () => (
    <Box 
      sx={{ 
        textAlign: 'center', 
        py: 4,
        px: 2,
        bgcolor: 'background.level1',
        borderRadius: 'sm',
        border: '1px dashed',
        borderColor: 'neutral.outlinedBorder'
      }}
    >
      <Typography level="h4" sx={{ mb: 1 }}>No bookings found</Typography>
      <Typography level="body-md" sx={{ mb: 2, color: 'neutral.500' }}>
        There are no bookings available for the selected time period.
      </Typography>
      {timeRange !== 'all' && (
        <Button 
          variant="soft" 
          color="primary"
          onClick={() => setTimeRange('all')}
        >
          View All Time
        </Button>
      )}
    </Box>
  );

  return (
    <Box sx={{ p: 4, maxWidth: '1600px', margin: '0 auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography level="h2">Admin Dashboard</Typography>
        <Select 
          value={timeRange}
          onChange={(_, value) => value && setTimeRange(value)}
          sx={{ minWidth: 150 }}
        >
          <Option value="all">All Time</Option>
          <Option value="day">Today</Option>
          <Option value="week">This Week</Option>
          <Option value="month">This Month</Option>
          <Option value="year">This Year</Option>
        </Select>
      </Box>

      {/* Key Statistics */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={`₹${totalRevenue.toLocaleString()}`}
            icon={<svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"/>
            </svg>}
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <StatCard
            title="Total Orders"
            value={totalBookings}
            icon={<svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-7-2h2V7h-4v2h2z"/>
            </svg>}
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <StatCard
            title="Average Order Value"
            value={`₹${avgRevenue.toLocaleString()}`}
            icon={<svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11 2v20c-5.07-.5-9-4.79-9-10s3.93-9.5 9-10zm2.03 0v8.99H22c-.47-4.74-4.24-8.52-8.97-8.99zm0 11.01V22c4.74-.47 8.5-4.25 8.97-8.99h-8.97z"/>
            </svg>}
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <StatCard
            title="Conversion Rate"
            value={`${((totalBookings / (totalBookings + (deliveryStatusCounts.pending || 0))) * 100).toFixed(1)}%`}
            icon={<svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"/>
            </svg>}
          />
        </Grid>
      </Grid>

      {/* Delivery Status */}
      <Typography level="h4" sx={{ mb: 2 }}>Delivery Status</Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid xs={12} sm={6} md={3}>
          <DeliveryStatusCard
            status="Pending"
            count={deliveryStatusCounts.pending || 0}
            total={totalBookings}
            color="#f44336"
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <DeliveryStatusCard
            status="Processing"
            count={deliveryStatusCounts.processing || 0}
            total={totalBookings}
            color="#ff9800"
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <DeliveryStatusCard
            status="Shipped"
            count={deliveryStatusCounts.shipped || 0}
            total={totalBookings}
            color="#2196f3"
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <DeliveryStatusCard
            status="Delivered"
            count={deliveryStatusCounts.delivered || 0}
            total={totalBookings}
            color="#4caf50"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {dashboardData.totalBookings === 0 ? (
          <Grid xs={12}>
            <NoDataMessage />
          </Grid>
        ) : (
          <>
            <Grid xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography level="h4" sx={{ mb: 2 }}>Revenue Trend</Typography>
                  <Box sx={{ height: 300 }}>
                    <Line data={revenueChartData} options={{ maintainAspectRatio: false }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography level="h4" sx={{ mb: 2 }}>Revenue by Crop</Typography>
                  <Box sx={{ height: 300 }}>
                    <Doughnut data={cropRevenueData} options={{ maintainAspectRatio: false }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
      </Grid>

      {/* Recent Orders */}
      <Typography level="h4" sx={{ mb: 2 }}>Recent Orders</Typography>
      <Sheet variant="outlined">
        <Table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {recentBookings && recentBookings.length > 0 ? (
              recentBookings.slice(0, 5).map((booking) => (
                <tr key={booking._id}>
                  <td>{booking._id?.slice(-6) || 'N/A'}</td>
                  <td>{booking.user?.name || 'N/A'}</td>
                  <td>{booking.crop?.name || 'N/A'}</td>
                  <td>₹{booking.price?.toLocaleString() || 'N/A'}</td>
                  <td>
                    <Box
                      sx={{
                        backgroundColor: 
                          booking.deliveryStatus === 'delivered' ? '#4caf50' :
                          booking.deliveryStatus === 'shipped' ? '#2196f3' :
                          booking.deliveryStatus === 'processing' ? '#ff9800' : '#f44336',
                        color: 'white',
                        px: 1,
                        py: 0.5,
                        borderRadius: 'sm',
                        display: 'inline-block'
                      }}
                    >
                      {booking.deliveryStatus ? (booking.deliveryStatus.charAt(0).toUpperCase() + booking.deliveryStatus.slice(1)) : 'Pending'}
                    </Box>
                  </td>
                  <td>{booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'N/A'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '1rem' }}>
                  {loading ? (
                    <CircularProgress size="sm" />
                  ) : (
                    'No recent orders found'
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Sheet>
    </Box>
  );
} 