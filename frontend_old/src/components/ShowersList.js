import React, { useEffect, useState } from "react";
import axios from "axios";

function ShowersList() {
  const [showers, setShowers] = useState([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/showers")
      .then(res => setShowers(res.data.meteor_showers))
      .catch(console.error);
  }, []);

  return (
    <div>
      <h2>Upcoming Meteor Showers</h2>
      <ul>
        {showers.map((s, i) => (
          <li key={i}>{s.name} → Peak: {s.peak}</li>
        ))}
      </ul>
    </div>
  );
}

export default ShowersList;
