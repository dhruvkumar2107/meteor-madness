import React, { useRef, useEffect } from "react";
import Globe from "react-globe.gl";

function RotatingGlobe() {
  const globeRef = useRef();

  // Dummy meteor/fireball data
  const fireballs = [
    { lat: 55.0, lng: 37.6, size: 1.5, name: "Moscow 2023" },
    { lat: 34.1, lng: -118.2, size: 2.0, name: "Los Angeles 2024" },
    { lat: -23.5, lng: 133.8, size: 1.2, name: "Australia 2022" },
    { lat: 19.4, lng: -99.1, size: 1.8, name: "Mexico City 2021" }
  ];

  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 0.6;
    }
  }, []);

  return (
    <div style={{ width: "100%", height: "600px", display: "flex", justifyContent: "center" }}>
      <Globe
        ref={globeRef}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        
        // Fireball points
        pointsData={fireballs}
        pointLat={(d) => d.lat}
        pointLng={(d) => d.lng}
        pointAltitude={(d) => d.size * 0.02}
        pointColor={() => "red"}
        pointLabel={(d) => `${d.name}`}
        pointRadius={(d) => d.size * 0.5}
        pointResolution={20}

        // Pulse animation
        ringsData={fireballs}
        ringLat={(d) => d.lat}
        ringLng={(d) => d.lng}
        ringColor={() => "rgba(255, 50, 50, 0.8)"}
        ringMaxRadius={(d) => d.size * 20}
        ringPropagationSpeed={5}
        ringRepeatPeriod={2000}
      />
    </div>
  );
}

export default RotatingGlobe;
