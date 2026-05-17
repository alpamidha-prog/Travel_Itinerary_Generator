from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_places(destination: str):
    return {"destination": destination, "places": []}
