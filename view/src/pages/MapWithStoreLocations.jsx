import React, { useRef, useEffect } from "react";
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";

const MapWithStoreLocations = ({ storeLocations }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    maptilersdk.config.apiKey = "DrLHBz4sGQJTXNNCWdc3";

    // Validate storeLocations data
    if (!storeLocations || !Array.isArray(storeLocations) || storeLocations.length === 0) {
      console.log("No valid store locations provided");
      return;
    }

    // Find first valid location with coordinates
    const firstValidLocation = storeLocations.find(
      loc => loc && loc.locations && Array.isArray(loc.locations.coordinates)
    );

    if (!firstValidLocation) {
      console.log("No valid coordinates found in store locations");
      return;
    }

    if (!map.current) {
      map.current = new maptilersdk.Map({
        container: mapContainer.current,
        style: maptilersdk.MapStyle.STREETS,
        center: firstValidLocation.locations.coordinates,
        zoom: 8,
      });

      // Add markers only for locations with valid coordinates
      storeLocations.forEach((location) => {
        if (location && location.locations && Array.isArray(location.locations.coordinates)) {
          const marker = new maptilersdk.Marker({ color: "#DD5746" })
            .setLngLat(location.locations.coordinates)
            .setPopup(new maptilersdk.Popup().setHTML(location.name || "Store"))
            .addTo(map.current);

          marker.getElement().addEventListener("mouseover", () => {
            marker.togglePopup();
          });

          marker.getElement().addEventListener("mouseout", () => {
            marker.togglePopup();
          });
        }
      });
    }
  }, [storeLocations]);

  return (
    <div
      ref={mapContainer}
      style={{
        height: "500px",
        width: "80%",
        marginLeft: "auto",
        marginRight: "auto",
      }}
    />
  );
};

export default MapWithStoreLocations;
