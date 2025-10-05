import React, { useState } from "react";
import axios from "axios";

function Simulator() {
  const [diameter, setDiameter] = useState(10);
  const [velocity, setVelocity] = useState(20);
  const [result, setResult] = useState(null);

  const simulate = () => {
    axios.post("http://127.0.0.1:8000/simulate", {
      diameter_m: diameter,
      velocity_kms: velocity
    })
    .then(res => setResult(res.data))
    .catch(err => console.log(err));
  };

  return (
    <div className="card">
      <h2>Impact Simulator</h2>
      <label>Diameter (m)</label>
      <input type="number" value={diameter} onChange={e => setDiameter(e.target.value)} />
      <label>Velocity (km/s)</label>
      <input type="number" value={velocity} onChange={e => setVelocity(e.target.value)} />
      <button onClick={simulate}>Simulate</button>
      {result && (
        <div>
          <p>Energy: {result.energy_megatons} MT</p>
          <p>Risk: {result.risk_level}</p>
          <p>Blast radius: {result.blast_radius_km} km</p>
        </div>
      )}
    </div>
  );
}

export default Simulator;
