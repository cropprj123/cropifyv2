import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Alert,
  Paper,
  Container,
  Slider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress
} from '@mui/material';
import { LocationOn } from '@mui/icons-material';
import * as maptilersdk from '@maptiler/sdk';
import "@maptiler/sdk/dist/maptiler-sdk.css";

const MapWithDiseases = ({ location, diseases, radius }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);

  useEffect(() => {
    maptilersdk.config.apiKey = "DrLHBz4sGQJTXNNCWdc3";

    if (!location) return;

    if (!map.current) {
      map.current = new maptilersdk.Map({
        container: mapContainer.current,
        style: maptilersdk.MapStyle.STREETS,
        center: [location.longitude, location.latitude],
        zoom: 15
      });

      // Add circle for radius
      map.current.on('load', () => {
        map.current.addSource('radius', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [location.longitude, location.latitude]
            },
            properties: {
              radius: radius
            }
          }
        });

        map.current.addLayer({
          id: 'radius-circle',
          type: 'circle',
          source: 'radius',
          paint: {
            'circle-radius': ['/', ['get', 'radius'], 0.5], // Adjust scale as needed
            'circle-color': 'rgba(66, 133, 244, 0.1)', // Light blue with transparency
            'circle-stroke-width': 2,
            'circle-stroke-color': '#4285F4' // Google Maps blue color
          }
        });
      });
    }

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add markers for diseases
    if (diseases) {
      diseases.forEach(disease => {
        const coordinates = disease.geolocation.coordinates;
        const marker = new maptilersdk.Marker()
          .setLngLat(coordinates)
          .setPopup(
            new maptilersdk.Popup().setHTML(
              `<div>
                <h3>${disease.cropDiseaseName}</h3>
                <p>Confidence: ${(disease.diseaseConfidence * 100).toFixed(1)}%</p>
                <p>Reported: ${new Date(disease.createdAt).toLocaleDateString()}</p>
              </div>`
            )
          )
          .addTo(map.current);

        markers.current.push(marker);
      });
    }

    // Update radius circle
    if (map.current.getSource('radius')) {
      map.current.getSource('radius').setData({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [location.longitude, location.latitude]
        },
        properties: {
          radius: radius
        }
      });
    }

  }, [location, diseases, radius]);

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

const NearbyDiseases = () => {
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [radius, setRadius] = useState(500); // Default 500m radius

  useEffect(() => {
    // Get user's location when component mounts
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setLocation(newLocation);
          fetchNearbyDiseases(newLocation, radius);
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

  const fetchNearbyDiseases = async (loc, rad) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/v1/farmer-disease-locations/nearby', {
        params: {
          latitude: loc.latitude,
          longitude: loc.longitude,
          radius: rad
        }
      });
      setDiseases(response.data.data.diseases);
    } catch (err) {
      console.error('Error fetching nearby diseases:', err);
      setError('Failed to fetch nearby diseases');
    } finally {
      setLoading(false);
    }
  };

  const handleRadiusChange = (event, newValue) => {
    setRadius(newValue);
    if (location) {
      fetchNearbyDiseases(location, newValue);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Nearby Disease Reports
        </Typography>

        {locationError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {locationError}
          </Alert>
        )}

        {location && (
          <Alert severity="info" icon={<LocationOn />} sx={{ mb: 2 }}>
            Your location: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom>
            Search Radius: {radius} meters
          </Typography>
          <Slider
            value={radius}
            onChange={handleRadiusChange}
            min={100}
            max={1000}
            step={100}
            marks={[
              { value: 100, label: '100m' },
              { value: 500, label: '500m' },
              { value: 1000, label: '1km' }
            ]}
            sx={{ mb: 4 }}
          />

          {location ? (
            <MapWithDiseases 
              location={location} 
              diseases={diseases}
              radius={radius}
            />
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

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : (
          <TableContainer component={Paper} sx={{ mt: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Disease Name</TableCell>
                  <TableCell align="right">Confidence</TableCell>
                  <TableCell align="right">Date Reported</TableCell>
                  <TableCell align="right">Distance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {diseases.map((disease) => (
                  <TableRow key={disease._id}>
                    <TableCell component="th" scope="row">
                      {disease.cropDiseaseName}
                    </TableCell>
                    <TableCell align="right">
                      {(disease.diseaseConfidence * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell align="right">
                      {new Date(disease.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      {calculateDistance(
                        location.latitude,
                        location.longitude,
                        disease.geolocation.coordinates[1],
                        disease.geolocation.coordinates[0]
                      ).toFixed(0)}m
                    </TableCell>
                  </TableRow>
                ))}
                {diseases.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No diseases reported in this area
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

// Helper function to calculate distance between two points in meters
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

export default NearbyDiseases;