from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import math, json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

with open("data/meteor_showers.json") as f:
    meteor_showers = json.load(f)

with open("data/fireballs.json") as f:
    fireballs = json.load(f)

class SimulationInput(BaseModel):
    diameter_m: float
    velocity_kms: float
    angle_deg: float = 45

JOULES_PER_MT_TNT = 4.184e15

def mass_from_diameter(d, density=3000):
    r = d / 2
    volume = (4/3) * math.pi * r**3
    return volume * density

def energy_megatons(diameter_m, velocity_kms):
    m = mass_from_diameter(diameter_m)
    v = velocity_kms * 1000
    energy_j = 0.5 * m * v**2
    return energy_j / JOULES_PER_MT_TNT

def risk_category(mt):
    if mt < 0.0001: return "Negligible"
    if mt < 0.01: return "Local"
    if mt < 1: return "City-level"
    if mt < 100: return "Regional"
    return "Global"

@app.get("/")
def root():
    return {"message": "Meteor Madness Backend is running 🚀"}

@app.get("/showers")
def get_showers():
    return {"meteor_showers": meteor_showers}

@app.get("/fireballs")
def get_fireballs():
    return {"fireballs": fireballs}

@app.post("/simulate")
def simulate_impact(sim: SimulationInput):
    mt = energy_megatons(sim.diameter_m, sim.velocity_kms)
    risk = risk_category(mt)
    radius_km = math.sqrt(mt)*5 if mt > 0 else 0
    return {
        "energy_megatons": round(mt, 4),
        "risk_level": risk,
        "blast_radius_km": round(radius_km, 2)
    }
