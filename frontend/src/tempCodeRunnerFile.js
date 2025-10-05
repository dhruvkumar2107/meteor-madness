import React, { useEffect, useState } from "react";
import Globe from "react-globe.gl";

export default function App() {
  const [impactData, setImpactData] = useState([]);
  const [filters, setFilters] = useState({
    showHistorical: true,
    showLive: true,
    showSimulated: true,
  });

  const [calcInput, setCalcInput] = useState({
    diameter: "",
    velocity: "",
    density: "",
    lat: "",
    lng: "",
  });
  const [results, setResults] = useState(null);
  const [cityImpact, setCityImpact] = useState(null);
  const [aiPrediction, setAiPrediction] = useState(null);

  // --- NEW GAME STATE ---
  const [gameMode, setGameMode] = useState(false);
  const [cityHealth, setCityHealth] = useState(100);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [exploded, setExploded] = useState(false);
  const [threats, setThreats] = useState([]); // Incoming asteroids
  const [explosions, setExplosions] = useState([]); // Visual rings for impacts

  useEffect(() => {
    const stored = localStorage.getItem("impactHighScore");
    if (stored) setHighScore(Number(stored));
  }, []);

  // --- STATIC DATA (Historical, Presets, Cities) ---
  const historicalEvents = [
    { name: "Chelyabinsk 2013", lat: 54.8, lng: 61.1, size: 0.5, color: "red", isHistorical: true },
    { name: "Tunguska 1908", lat: 60.9, lng: 101.9, size: 0.8, color: "yellow", isHistorical: true },
    { name: "Chicxulub 66M yrs ago", lat: 21.4, lng: -89.0, size: 1.5, color: "purple", isHistorical: true },
  ];
  const presets = [
    { name: "Chelyabinsk 2013", diameter: 20, velocity: 19, density: 3000, lat: 54.8, lng: 61.1 },
    { name: "Tunguska 1908", diameter: 50, velocity: 27, density: 3000, lat: 60.9, lng: 101.9 },
    { name: "Chicxulub Extinction", diameter: 10000, velocity: 20, density: 3000, lat: 21.4, lng: -89.0 },
  ];
  const cities = [
    { name: "Bengaluru, India", lat: 12.97, lng: 77.59, population: 12000000 },
    { name: "New York, USA", lat: 40.71, lng: -74.01, population: 8500000 },
    { name: "Tokyo, Japan", lat: 35.68, lng: 139.69, population: 37000000 },
    { name: "Paris, France", lat: 48.85, lng: 2.35, population: 11000000 },
  ];

  // Fetch NASA fireballs
  useEffect(() => {
    async function loadFireballs() {
      try {
        const res = await fetch("https://ssd-api.jpl.nasa.gov/fireball.api?req-loc=true&limit=50");
        const j = await res.json();
        const fields = j.fields;
        const rows = j.data || [];

        const fireballs = rows.map((r) => {
          const obj = {};
          fields.forEach((f, i) => (obj[f] = r[i]));
          let lat = parseFloat(obj.lat || 0);
          if (obj["lat-dir"] === "S") lat = -lat;
          let lon = parseFloat(obj.lon || 0);
          if (obj["lon-dir"] === "W") lon = -lon;
          return {
            name: obj.date,
            lat,
            lng: lon,
            size: Math.log10((parseFloat(obj["impact-e"] || 1) + 1)) * 0.3 || 0.1,
            color: "orange",
            isLive: true,
          };
        });
        setImpactData([...historicalEvents, ...fireballs]);
      } catch (e) {
        console.error("Failed to load fireballs:", e);
        setImpactData(historicalEvents);
      }
    }
    loadFireballs();
  }, []);

  // --- NEW GAME LOOP ---
  useEffect(() => {
    if (!gameMode) {
      setThreats([]);
      return;
    }

    const gameTick = setInterval(() => {
      // 1. DIFFICULTY SCALING
      const difficulty = 1 + Math.floor(score / 1500); // Harder every 1500 points
      const spawnChance = Math.min(0.8, 0.2 + difficulty * 0.1); // Max 80% spawn chance
      
      // 2. SPAWN A NEW THREAT
      if (Math.random() < spawnChance) {
        const newThreat = {
          id: new Date().getTime() + Math.random(),
          lat: Math.random() * 180 - 90,
          lng: Math.random() * 360 - 180,
          size: Math.random() * 0.6 + 0.2,
          color: "red",
          isThreat: true,
          diameter: Math.floor(Math.random() * (100 * difficulty) + 20),
          velocity: Math.floor(Math.random() * 20 + 10 * difficulty),
          density: 3000,
        };
        setThreats((prev) => [...prev, newThreat]);
      }

      // 3. CHECK FOR IMPACTS (oldest threats hit first)
      setThreats((prev) => {
        if (prev.length > 5 + difficulty * 2) {
          const impactThreat = prev[0];
          console.log("IMPACT!", impactThreat);
          calculateImpact({ ...impactThreat, isGameImpact: true });
          return prev.slice(1);
        }
        return prev;
      });
    }, 1000); // Game ticks every second

    return () => clearInterval(gameTick);
  }, [gameMode, score]); // Rerun effect if game mode changes or score (for difficulty)

  // AI prediction
  const predictImpactEffects = (mtTNT, diameter, velocity) => {
    let severity = "Low";
    let description = "Minor atmospheric burst, limited local damage.";
    let extinctionRisk = "Negligible";
    if (mtTNT > 50 && mtTNT < 1000) {
      severity = "Moderate";
      description = "City-scale destruction, significant casualties.";
    } else if (mtTNT >= 1000 && mtTNT < 100000) {
      severity = "High";
      description = "Regional catastrophe, long-term climate impact possible.";
    } else if (mtTNT >= 100000) {
      severity = "Extinction-level";
      description = "Global climate change, mass extinction risk.";
      extinctionRisk = "High";
    }
    setAiPrediction({ severity, description, extinctionRisk, notes: `D=${diameter}m, V=${velocity} km/s` });
  };

  // Calculator (now also handles game impacts)
  const calculateImpact = (input) => {
    const d = parseFloat(input.diameter) || 0;
    const v = parseFloat(input.velocity) || 0;
    const rho = parseFloat(input.density) || 3000;
    const lat = parseFloat(input.lat) || 0;
    const lng = parseFloat(input.lng) || 0;

    const mass = (4 / 3) * Math.PI * Math.pow(d / 2, 3) * rho;
    const ke = 0.5 * mass * Math.pow(v * 1000, 2);
    const mtTNT = ke / 4.184e15;
    const crater = Math.pow(mtTNT, 0.33) * 120;
    const blastRadius = Math.pow(mtTNT, 0.33) * 10;

    const comparisons = [
      { name: "Hiroshima Bomb", energy: 0.015 }, { name: "Tunguska Event", energy: 15 },
      { name: "Mount St. Helens Eruption", energy: 24 }, { name: "Chicxulub Extinction Event", energy: 1e5 }
    ];
    const closest = comparisons.reduce((prev, curr) => Math.abs(curr.energy - mtTNT) < Math.abs(prev.energy - mtTNT) ? curr : prev);

    setResults({ mtTNT, crater, blastRadius, closest });
    predictImpactEffects(mtTNT, d, v);

    if (gameMode && input.isGameImpact) {
      const damage = Math.min(40, Math.floor(mtTNT / 100)); // Damage from missed threat
      setCityHealth((prev) => {
        const newHealth = Math.max(prev - damage, 0);
        if (newHealth <= 0 && !exploded) {
            setExploded(true);
            // Update high score if needed
            if (score > highScore) {
                setHighScore(score);
                localStorage.setItem("impactHighScore", score);
            }
        }
        return newHealth;
      });
    }

    const pointColor = input.isGameImpact ? "orange" : "cyan";
    const blastPoint = {
      name: `Impact (${mtTNT.toFixed(1)} Mt TNT)`, lat, lng,
      size: Math.log10(mtTNT + 1) * 0.6, color: pointColor, isSimulated: true,
    };
    setImpactData((prev) => [...prev, blastPoint]);

    // Create visual explosion ring
    const newExplosion = {
        lat: lat, lng: lng, maxR: blastRadius / 111,
        propagationSpeed: (blastRadius / 111) / 2, repeat: 0,
    };
    setExplosions(prev => [...prev, newExplosion]);
  };

  const handlePreset = (preset) => {
    setCalcInput(preset);
    calculateImpact(preset);
  };
  
  // --- NEW UNIFIED CLICK HANDLER ---
  const handlePointClick = (point) => {
    if (point.isThreat) {
        // Player successfully destroyed a threat
        setThreats(prev => prev.filter(t => t.id !== point.id));
        setScore(prev => prev + 100);
    } else {
        // Player clicked a historical/simulated point
        alert(`${point.name}`);
    }
  };
  
  // Player clicks on empty space (for manual simulation)
  const handleGlobeClick = ({ lat, lng }) => {
    if (gameMode) return; // Disable manual simulation in game mode
    const randomAsteroid = {
      diameter: Math.floor(Math.random() * 200 + 20),
      velocity: Math.floor(Math.random() * 30 + 11),
      density: 3000, lat, lng
    };
    setCalcInput(randomAsteroid);
    calculateImpact(randomAsteroid);
  };
  
  const estimateCityImpact = (city) => { /* ... (no changes needed) */ };
  const visibleData = impactData.filter((d) => { /* ... (no changes needed) */ });

  // --- MERGE VISIBLE DATA WITH THREATS FOR RENDERING ---
  const allVisibleData = [...visibleData, ...threats];

  return (
    <div style={{ background: "#000", height: "100vh", color: "#fff", fontFamily: "Segoe UI, sans-serif" }}>
      {!exploded ? (
        <Globe
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          showAtmosphere={true} atmosphereColor="lightskyblue" atmosphereAltitude={0.15}
          pointsData={allVisibleData}
          pointLat="lat" pointLng="lng" pointColor="color"
          pointAltitude="size" pointRadius={0.4}
          onPointClick={handlePointClick}
          onGlobeClick={handleGlobeClick}
          // --- NEW RING PROPS FOR EXPLOSIONS ---
          ringsData={explosions}
          ringColor={() => 'orange'}
          ringMaxRadius="maxR"
          ringPropagationSpeed="propagationSpeed"
          ringRepeat="repeat"
        />
      ) : (
        <div style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%',
          fontSize: "5rem", color: "red", animation: "boom 1.5s ease forwards"
        }}>
          <div>💥🌍</div>
          <h2 style={{fontSize: '3rem', margin: '20px 0'}}>EARTH HAS FALLEN</h2>
          <h3 style={{fontSize: '2rem', color: '#ffcc00'}}>Final Score: {score}</h3>
        </div>
      )}

      {/* --- UI PANEL --- */}
      <div style={{
        position: "absolute", top: 20, right: 20, background: "rgba(25,25,25,0.92)", 
        padding: "20px", borderRadius: "12px", width: "340px", boxShadow: "0 4px 15px rgba(0,0,0,0.5)"
      }}>
        <h2 style={{ textAlign: "center", marginBottom: "15px", color: "#ffcc00" }}>
          {gameMode ? "🌎 Planetary Defense" : "⚡ Impact Calculator"}
        </h2>

        {/* --- GAME MODE UI --- */}
        <div style={{ padding: "10px", background: "#111", borderRadius: "8px", border: "1px solid cyan", marginBottom: '15px' }}>
          <h3>🎮 Impact Survival Game</h3>
          <button onClick={() => {
            setGameMode(!gameMode); setCityHealth(100); setScore(0);
            setExploded(false); setThreats([]); setExplosions([]);
          }}>
            {gameMode ? "Exit Game" : "Start Planetary Defense"}
          </button>
          {gameMode && (
            <div style={{ marginTop: "15px" }}>
              <p>Earth Health: <b style={{color: 'lightgreen'}}>{cityHealth}% ❤️</b></p>
              <p>Score: <b style={{color: 'yellow'}}>{score} ⭐</b></p>
              <p>High Score: 🏆 {highScore}</p>
              {cityHealth <= 0 && (
                <>
                  <h3 style={{ color: "red" }}>💥 Game Over!</h3>
                  <button onClick={() => {
                      setCityHealth(100); setScore(0); setExploded(false);
                      setThreats([]); setExplosions([]);
                  }}>
                    🔄 Restart
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* --- CALCULATOR UI (conditionally rendered) --- */}
        {!gameMode && (
          <>
            <div style={{ display: "grid", gap: "10px" }}>
              {["diameter", "velocity", "density", "lat", "lng"].map((field) => (
                <label key={field}>
                  {field.charAt(0).toUpperCase() + field.slice(1)}:
                  <input
                    type="number" value={calcInput[field]}
                    onChange={(e) => setCalcInput({ ...calcInput, [field]: e.target.value })}
                    style={{ width: "100%", padding: "6px", borderRadius: "6px", border: "1px solid #555", background: "#111", color: "#fff" }}
                  />
                </label>
              ))}
            </div>
            <button onClick={() => calculateImpact(calcInput)} style={{ marginTop: "15px", width: "100%", padding: "10px", background: "linear-gradient(90deg, #ff9800, #ff5722)", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", color: "#fff" }}>
              🚀 Calculate Impact
            </button>
            {results && (
              <div style={{ marginTop: "20px", padding: "12px", borderRadius: "8px", background: "#1a1a1a", border: "1px solid #444" }}>
                <h4 style={{ color: "#ffcc00" }}>Results:</h4>
                <p>💥 Energy: <b>{results.mtTNT.toFixed(2)} Mt TNT</b></p>
                <p>🕳️ Crater: <b>{results.crater.toFixed(0)} m</b></p>
                <p>🌪️ Blast Radius: ~<b>{results.blastRadius.toFixed(1)} km</b></p>
                <p>📊 Comparable to: <b>{results.closest.name}</b></p>
              </div>
            )}
            {aiPrediction && (
              <div style={{ marginTop: "20px", padding: "12px", borderRadius: "8px", background: "#222", border: "1px solid orange" }}>
                <h4 style={{ color: "orange" }}>🤖 AI Prediction</h4>
                <p>Severity: <b>{aiPrediction.severity}</b></p>
                <p>{aiPrediction.description}</p>
                <p>🌍 Extinction Risk: <b>{aiPrediction.extinctionRisk}</b></p>
              </div>
            )}
            <h4 style={{ marginTop: "20px", color: "#80dfff" }}>Presets</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {presets.map((p, i) => (
                <button key={i} onClick={() => handlePreset(p)} style={{ flex: "1 1 45%", padding: "8px", background: "#333", border: "1px solid #555", borderRadius: "6px", color: "#fff", cursor: "pointer", fontSize: "13px" }}>
                  {p.name}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}