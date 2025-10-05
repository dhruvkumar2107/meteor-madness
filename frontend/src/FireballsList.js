import React, { useEffect, useState } from "react";
import axios from "axios";

function FireballsList() {
  const [fireballs, setFireballs] = useState([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/fireballs")
      .then(res => setFireballs(res.data.fireballs))
      .catch(err => console.log(err));
  }, []);

  return (
    <div className="card">
      <h2>Fireballs</h2>
      <ul>
        {fireballs.map((f, idx) => (
          <li key={idx}>
            {f.date} — Lat: {f.lat}, Lon: {f.lon} — Energy: {f.energy_kT} kT
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FireballsList;
