# Start Backend
Start-Process powershell -ArgumentList "-NoExit -Command `"cd travel-itinerary-backend; .\venv\Scripts\Activate.ps1; uvicorn main:app --reload`""

# Start Frontend
Start-Process powershell -ArgumentList "-NoExit -Command `"cd travel-frontend; npm run dev`""
