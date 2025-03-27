import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Container,
  Divider
} from '@mui/material';
import { PhotoCamera, LocationOn } from '@mui/icons-material';
import * as maptilersdk from '@maptiler/sdk';
import "@maptiler/sdk/dist/maptiler-sdk.css";
import NearbyDiseases from './NearbyDiseases';

const MapWithLocation = ({ location }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    maptilersdk.config.apiKey = "DrLHBz4sGQJTXNNCWdc3";

    if (!location) return;

    if (!map.current) {
      map.current = new maptilersdk.Map({
        container: mapContainer.current,
        style: maptilersdk.MapStyle.STREETS,
        center: [location.longitude, location.latitude],
        zoom: 14
      });

      // Add marker
      new maptilersdk.Marker({ color: "#DD5746" })
        .setLngLat([location.longitude, location.latitude])
        .setPopup(new maptilersdk.Popup().setHTML("Your Location"))
        .addTo(map.current);
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [location]);

  return (
    <div
      ref={mapContainer}
      style={{
        height: "500px",
        width: "100%",
        borderRadius: "8px",
        overflow: "hidden"
      }}
    />
  );
};

const DiseaseLocationReport = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    // Get user's location when component mounts
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          setLocationError('Unable to get your location. Please enable location services.');
          console.error('Location Error:', error);
        }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser.');
    }
  }, []);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select an image');
      return;
    }

    if (!location) {
      setError('Location data is required. Please enable location services.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('latitude', location.latitude);
    formData.append('longitude', location.longitude);

    try {
      const response = await axios.post('/api/v1/farmer-disease-locations', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess(true);
      setSelectedFile(null);
      setPreviewUrl(null);
      
      // Show success message with disease prediction
      const prediction = response.data.data.prediction;
      setSuccess(`Successfully reported ${prediction.disease} with ${(prediction.confidence * 100).toFixed(1)}% confidence`);
    } catch (error) {
      console.error('Submission Error:', error);
      setError(error.response?.data?.message || 'Failed to submit disease report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Report Disease Location
        </Typography>

        {locationError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {locationError}
          </Alert>
        )}

        {location && (
          <Alert severity="info" icon={<LocationOn />} sx={{ mb: 2 }}>
            Location detected: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
          </Alert>
        )}

        {/* Map Container */}
        <Box sx={{ mb: 3 }}>
          {location ? (
            <MapWithLocation location={location} />
          ) : (
            <Box
              sx={{
                height: "500px",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "grey.100",
                borderRadius: "8px"
              }}
            >
              <Typography color="text.secondary">
                Waiting for location...
              </Typography>
            </Box>
          )}
        </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {/* Image Preview */}
          {previewUrl && (
            <Box sx={{ mb: 2, textAlign: 'center' }}>
              <img
                src={previewUrl}
                alt="Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '300px',
                  objectFit: 'contain'
                }}
              />
            </Box>
          )}

          {/* Upload Button */}
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <input
              accept="image/*"
              type="file"
              id="image-upload"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <label htmlFor="image-upload">
              <Button
                variant="contained"
                component="span"
                startIcon={<PhotoCamera />}
                sx={{ mb: 2 }}
              >
                Select Image
              </Button>
            </label>
          </Box>

          {/* Error Message */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Success Message */}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {/* Submit Button */}
          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={!selectedFile || loading || !location}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Submit Report'}
            </Button>
          </Box>
        </Box>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Nearby Diseases Section */}
      <NearbyDiseases />
    </Container>
  );
};

export default DiseaseLocationReport; 