from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_itineraries():
    return {"message": "List of itineraries"}

@router.post("/generate")
def generate_itinerary(config: dict):
    destination = config.get("destination", "Unknown Destination")
    # Provide simple generic mock data that adapts to destination
    lat, lng = 48.8566, 2.3522 # Default to Paris
    if "Helsinki" in destination:
        lat, lng = 60.1695, 24.9354
    elif "London" in destination:
        lat, lng = 51.5074, -0.1278
        
    duration = config.get("duration", 3)
    days = []
    for i in range(duration):
        days.append({
            "day_number": i + 1,
            "activities": [
                {"name": f"Explore {destination} City Center", "location": {"lat": lat + (i * 0.01), "lng": lng + (i * 0.01)}},
                {"name": f"Visit popular museum in {destination}", "location": {"lat": lat - (i * 0.01), "lng": lng - (i * 0.01)}}
            ]
        })

    return {
        "destination": destination,
        "center": {"lat": lat, "lng": lng},
        "days": days
    }
