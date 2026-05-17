from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import itinerary, user, places

app = FastAPI(title="Travel Itinerary API")

# CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(itinerary.router, prefix="/api/itinerary", tags=["itinerary"])
app.include_router(user.router, prefix="/api/user", tags=["user"])
app.include_router(places.router, prefix="/api/places", tags=["places"])

@app.get("/")
def root():
    return {"message": "Travel Itinerary API"}
