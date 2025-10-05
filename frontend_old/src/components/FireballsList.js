import React, { useEffect, useState } from "react";
import axios from "axios";

function FireballsList() {
  const [fireballs, setFireballs] = useState([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/fireballs")
      .then(res => setFireballs(res.data.fireballs))
      .catch(console.error);
  }, []);

  return (
    <div>
      <h2>Past Fireballs</h2>
      <ul>
        {fireballs.map((f, i) => (
          <li key={i}>{f.date} → Energy: {f.energy_kT} kT</li>
        ))}
      </ul>
    </div>
  );
}

export default FireballsList;
