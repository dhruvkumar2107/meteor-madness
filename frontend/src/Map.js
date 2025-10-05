import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function Map() {
  return (
    <div className="card">
      <h2>Map Visualization</h2>
      <MapContainer center={[20, 0]} zoom={2} style={{ height: "400px", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Add markers for meteor showers or fireballs here if you want */}
      </MapContainer>
    </div>
  );
}

export default Map;
