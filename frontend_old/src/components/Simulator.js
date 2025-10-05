import React, { useState } from "react";
import axios from "axios";

function Simulator() {
  const [diameter, setDiameter] = useState(50);
  const [velocity, setVelocity] = useState(20);
  const [result, setResult] = useState(null);

  const simulate = () => {
    axios.post("http://127.0.0.1:8000/simulate", {
      diameter_m: diameter,
      velocity_kms: velocity
    })
    .then(res => setResult(res.data))
    .catch(console.error);
  };

  return (
    <div>
      <h2>Impact Simulator</h2>
      <input type="number" value={diameter} onChange={e => setDiameter(e.target.value)} /> m Diameter
      <br />
      <input type="number" value={velocity} onChange={e => setVelocity(e.target.value)} /> km/s Velocity
      <br />
      <button onClick={simulate}>Simulate</button>
      {result && (
        <div>
          <p>Energy: {result.energy_megatons} Mt TNT</p>
          <p>Risk Level: {result.risk_level}</p>
          <p>Blast Radius: {result.blast_radius_km} km</p>
        </div>
      )}
    </div>
  );
}

export default Simulator;
