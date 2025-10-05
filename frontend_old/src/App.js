import React from "react";
import ShowersList from "./components/ShowersList";
import FireballsList from "./components/FireballsList";
import Simulator from "./components/Simulator";

function App() {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Meteor Madness 🌠</h1>
      <ShowersList />
      <FireballsList />
      <Simulator />
    </div>
  );
}

export default App;
