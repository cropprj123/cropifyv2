import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Input,
  Modal,
  ModalDialog,
  Select,
  Option,
  Sheet,
  Table,
  Typography,
  IconButton,
  Tooltip,
  Alert,
  Stack
} from '@mui/joy';
import axios from 'axios';
import { format } from 'date-fns';

// Status color mapping
const statusColors = {
  pending: 'warning',
  processing: 'info',
  shipped: 'primary',
  delivered: 'success'
};

// Status Update Modal Component
const StatusUpdateModal = ({ open, onClose, booking, onUpdate }) => {
  const [newStatus, setNewStatus] = useState(booking?.deliveryStatus || 'pending');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpdate = async () => {
    try {
      setLoading(true);
      setError('');
      await onUpdate(booking._id, newStatus);
      onClose();
    } catch (err) {
      setError('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        aria-labelledby="status-modal-title"
        aria-describedby="status-modal-description"
        sx={{ maxWidth: 400 }}
      >
        <Typography id="status-modal-title" level="h4" sx={{ mb: 2 }}>
          Update Delivery Status
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography level="body-sm" sx={{ mb: 1 }}>Order #{booking?._id?.slice(-6)}</Typography>
          <Typography level="body-sm" sx={{ mb: 1 }}>Customer: {booking?.user?.name}</Typography>
          <Typography level="body-sm">Product: {booking?.crop?.name}</Typography>
        </Box>

        <Select
          value={newStatus}
          onChange={(_, value) => value && setNewStatus(value)}
          sx={{ mb: 2 }}
        >
          <Option value="pending">Pending</Option>
          <Option value="processing">Processing</Option>
          <Option value="shipped">Shipped</Option>
          <Option value="delivered">Delivered</Option>
        </Select>

        {error && (
          <Alert color="danger" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button variant="plain" color="neutral" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            loading={loading}
            onClick={handleUpdate}
          >
            Update Status
          </Button>
        </Box>
      </ModalDialog>
    </Modal>
  );
};

// Details Modal Component
const DetailsModal = ({ open, onClose, booking }) => {
  if (!booking) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        aria-labelledby="details-modal-title"
        sx={{ maxWidth: 500 }}
      >
        <Typography id="details-modal-title" level="h4" sx={{ mb: 3 }}>
          Order Details
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography level="h5" sx={{ mb: 2 }}>Order Information</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography>Order ID: #{booking._id?.slice(-6)}</Typography>
                  <Typography>Date: {format(new Date(booking.createdAt), 'PPP')}</Typography>
                  <Typography>Amount: ₹{booking.price?.toLocaleString()}</Typography>
                  <Typography>Status: 
                    <Chip
                      sx={{ ml: 1 }}
                      variant="soft"
                      color={statusColors[booking.deliveryStatus]}
                      size="sm"
                    >
                      {booking.deliveryStatus?.charAt(0).toUpperCase() + booking.deliveryStatus?.slice(1)}
                    </Chip>
                  </Typography>
                  <Typography>Verification: 
                    <Chip
                      sx={{ ml: 1 }}
                      variant="soft"
                      color={booking.isVerified ? 'success' : 'warning'}
                      size="sm"
                    >
                      {booking.isVerified ? 'Verified' : 'Pending'}
                    </Chip>
                  </Typography>
                  {booking.verifiedAt && (
                    <Typography>Verified At: {format(new Date(booking.verifiedAt), 'PPP')}</Typography>
                  )}
                  {booking.verificationCode && (
                    <Typography>Verification Code: {booking.verificationCode}</Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography level="h5" sx={{ mb: 2 }}>Customer</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography>Name: {booking.user?.name}</Typography>
                  <Typography>Email: {booking.user?.email}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography level="h5" sx={{ mb: 2 }}>Product</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography>Name: {booking.crop?.name}</Typography>
                  <Typography>Seller: {booking.crop?.soldby?.name || 'N/A'}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button variant="plain" color="neutral" onClick={onClose}>
            Close
          </Button>
        </Box>
      </ModalDialog>
    </Modal>
  );
};

// Verification Modal Component
const VerificationModal = ({ open, onClose, booking, onVerify }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.post('/api/v1/bookings/verify-delivery', {
        bookingId: booking._id,
        verificationCode
      });

      if (response.data.status === 'success') {
        onVerify(booking._id);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify delivery');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        aria-labelledby="verification-modal-title"
        aria-describedby="verification-modal-description"
        sx={{ maxWidth: 400 }}
      >
        <Typography id="verification-modal-title" level="h4" sx={{ mb: 2 }}>
          Verify Delivery
        </Typography>
        <Typography id="verification-modal-description" level="body-md" sx={{ mb: 3 }}>
          Enter the verification code to confirm delivery for order #{booking?._id?.slice(-6)}
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography level="body-sm" sx={{ mb: 1 }}>Customer: {booking?.user?.name}</Typography>
          <Typography level="body-sm" sx={{ mb: 1 }}>Product: {booking?.crop?.name}</Typography>
          <Typography level="body-sm">Amount: ₹{booking?.price?.toLocaleString()}</Typography>
        </Box>

        <Input
          placeholder="Enter verification code"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          sx={{ mb: 2 }}
        />

        {error && (
          <Alert color="danger" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button variant="plain" color="neutral" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            loading={loading}
            onClick={handleVerify}
            disabled={!verificationCode}
          >
            Verify Delivery
          </Button>
        </Box>
      </ModalDialog>
    </Modal>
  );
};

// Main Component
export default function DeliveryManagement() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ field: 'createdAt', order: 'desc' });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [deliveryStats, setDeliveryStats] = useState({});

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: searchQuery,
        sortBy: sortConfig.field,
        sortOrder: sortConfig.order,
        dateFilter: dateFilter === 'all' ? '' : dateFilter,
        status: statusFilter === 'all' ? '' : statusFilter
      });

      const response = await axios.get(`/api/v1/bookings/delivery-management?${params}`);
      
      if (response.data?.status === 'success') {
        setBookings(response.data.data.data || []);
        setDeliveryStats(response.data.deliveryStats || {});
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch bookings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, dateFilter, sortConfig]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleSort = (field) => {
    setSortConfig(prev => ({
      field,
      order: prev.field === field && prev.order === 'desc' ? 'asc' : 'desc'
    }));
  };

  const handleVerificationSuccess = (bookingId) => {
    setBookings(bookings.map(booking => 
      booking._id === bookingId 
        ? { ...booking, deliveryStatus: 'delivered', isVerified: true }
        : booking
    ));
    fetchBookings(); // Refresh to update stats
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await axios.patch(`/api/v1/bookings/${bookingId}/delivery-status`, {
        deliveryStatus: newStatus
      });
      fetchBookings(); // Refresh to update stats
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await fetch('/api/v1/bookings/report');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'bookings-report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error('Failed to download report:', err);
    }
  };

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
        <Button onClick={fetchBookings} sx={{ mt: 2 }} variant="soft">
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: '1600px', margin: '0 auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography level="h2">Delivery Management</Typography>
        <Button 
          variant="outlined" 
          color="neutral" 
          onClick={handleExportExcel}
          startDecorator={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M12 2.25a.75.75 0 01.75.75v11.69l3.22-3.22a.75.75 0 111.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06l3.22 3.22V3a.75.75 0 01.75-.75zm-9 13.5a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
            </svg>
          }
        >
          Export Report
        </Button>
      </Box>

      {/* Filters and Search */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid xs={12} sm={6} md={3}>
          <Input
            placeholder="Search by customer or product"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            startDecorator={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clipRule="evenodd" />
              </svg>
            }
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Select 
            value={statusFilter}
            onChange={(_, value) => value && setStatusFilter(value)}
            sx={{ minWidth: 200 }}
          >
            <Option value="all">All Status</Option>
            <Option value="pending">Pending</Option>
            <Option value="processing">Processing</Option>
            <Option value="shipped">Shipped</Option>
            <Option value="delivered">Delivered</Option>
          </Select>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Select 
            value={dateFilter}
            onChange={(_, value) => value && setDateFilter(value)}
            sx={{ minWidth: 200 }}
          >
            <Option value="all">All Time</Option>
            <Option value="today">Today</Option>
            <Option value="week">Last 7 Days</Option>
            <Option value="month">Last 30 Days</Option>
          </Select>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Select 
            value={`${sortConfig.field}-${sortConfig.order}`}
            onChange={(_, value) => {
              if (value) {
                const [field, order] = value.split('-');
                setSortConfig({ field, order });
              }
            }}
            sx={{ minWidth: 200 }}
          >
            <Option value="createdAt-desc">Newest First</Option>
            <Option value="createdAt-asc">Oldest First</Option>
            <Option value="price-desc">Price: High to Low</Option>
            <Option value="price-asc">Price: Low to High</Option>
          </Select>
        </Grid>
      </Grid>

      {/* Delivery Status Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {['pending', 'processing', 'shipped', 'delivered'].map(status => {
          const count = deliveryStats[status] || 0;
          const total = Object.values(deliveryStats).reduce((sum, val) => sum + val, 0);
          
          return (
            <Grid key={status} xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent>
                  <Typography level="body-sm" sx={{ mb: 1 }}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Typography>
                  <Typography level="h3">{count}</Typography>
                  <Box sx={{ mt: 2, height: 4, bgcolor: 'background.level2', borderRadius: 2 }}>
                    <Box 
                      sx={{ 
                        width: `${total > 0 ? (count / total) * 100 : 0}%`, 
                        height: '100%', 
                        bgcolor: statusColors[status],
                        borderRadius: 2
                      }} 
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Orders Table */}
      <Sheet variant="outlined" sx={{ borderRadius: 'sm' }}>
        <Table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>
                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleSort('user.name')}>
                  Customer
                  {sortConfig.field === 'user.name' && (
                    <span>{sortConfig.order === 'desc' ? ' ↓' : ' ↑'}</span>
                  )}
                </Box>
              </th>
              <th>
                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleSort('crop.name')}>
                  Product
                  {sortConfig.field === 'crop.name' && (
                    <span>{sortConfig.order === 'desc' ? ' ↓' : ' ↑'}</span>
                  )}
                </Box>
              </th>
              <th>
                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleSort('price')}>
                  Amount
                  {sortConfig.field === 'price' && (
                    <span>{sortConfig.order === 'desc' ? ' ↓' : ' ↑'}</span>
                  )}
                </Box>
              </th>
              <th>Status</th>
              <th>Verification</th>
              <th>
                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleSort('createdAt')}>
                  Date
                  {sortConfig.field === 'createdAt' && (
                    <span>{sortConfig.order === 'desc' ? ' ↓' : ' ↑'}</span>
                  )}
                </Box>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length > 0 ? (
              bookings.map((booking) => (
                <tr key={booking._id}>
                  <td>{booking._id?.slice(-6) || 'N/A'}</td>
                  <td>
                    <Box>
                      <Typography level="body-sm">{booking.user?.name || 'N/A'}</Typography>
                      <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
                        {booking.user?.email || 'N/A'}
                      </Typography>
                    </Box>
                  </td>
                  <td>
                    <Box>
                      <Typography level="body-sm">{booking.crop?.name || 'N/A'}</Typography>
                      <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
                        Seller: {booking.crop?.soldby?.name || 'N/A'}
                      </Typography>
                    </Box>
                  </td>
                  <td>₹{booking.price?.toLocaleString() || 'N/A'}</td>
                  <td>
                    <Chip
                      variant="soft"
                      color={statusColors[booking.deliveryStatus] || 'default'}
                      size="sm"
                    >
                      {booking.deliveryStatus ? 
                        (booking.deliveryStatus.charAt(0).toUpperCase() + booking.deliveryStatus.slice(1)) 
                        : 'Pending'}
                    </Chip>
                  </td>
                  <td>
                    <Chip
                      variant="soft"
                      color={booking.isVerified ? 'success' : 'warning'}
                      size="sm"
                    >
                      {booking.isVerified ? 'Verified' : 'Pending'}
                    </Chip>
                  </td>
                  <td>{booking.createdAt ? format(new Date(booking.createdAt), 'PP') : 'N/A'}</td>
                  <td>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Update Status">
                        <IconButton
                          variant="plain"
                          color="neutral"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setStatusModalOpen(true);
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 000-1.06l-3-3a.75.75 0 10-1.06 1.06l1.72 1.72H8.25a.75.75 0 000 1.5h5.69l-1.72 1.72a.75.75 0 101.06 1.06l3-3z" clipRule="evenodd" />
                          </svg>
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Verify Delivery">
                        <IconButton
                          variant="plain"
                          color="primary"
                          disabled={booking.isVerified || booking.deliveryStatus === 'delivered'}
                          onClick={() => {
                            setSelectedBooking(booking);
                            setVerificationModalOpen(true);
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                          </svg>
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Details">
                        <IconButton
                          variant="plain"
                          color="neutral"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setDetailsModalOpen(true);
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                            <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
                          </svg>
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Sheet>

      {/* Modals */}
      {selectedBooking && (
        <>
          <VerificationModal
            open={verificationModalOpen}
            onClose={() => {
              setVerificationModalOpen(false);
              setSelectedBooking(null);
            }}
            booking={selectedBooking}
            onVerify={handleVerificationSuccess}
          />
          <StatusUpdateModal
            open={statusModalOpen}
            onClose={() => {
              setStatusModalOpen(false);
              setSelectedBooking(null);
            }}
            booking={selectedBooking}
            onUpdate={handleStatusUpdate}
          />
          <DetailsModal
            open={detailsModalOpen}
            onClose={() => {
              setDetailsModalOpen(false);
              setSelectedBooking(null);
            }}
            booking={selectedBooking}
          />
        </>
      )}
    </Box>
  );
} 