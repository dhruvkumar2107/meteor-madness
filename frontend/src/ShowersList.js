import React, { useEffect, useState } from "react";
import axios from "axios";

function ShowersList() {
  const [showers, setShowers] = useState([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/showers")
      .then(res => setShowers(res.data.meteor_showers))
      .catch(err => console.log(err));
  }, []);

  return (
    <div className="card">
      <h2>Meteor Showers</h2>
      <ul>
        {showers.map((s, idx) => (
          <li key={idx}>
            <strong>{s.name}</strong> — Peak: {s.peak} — RA: {s.radiant.ra}, Dec: {s.radiant.dec}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ShowersList;
