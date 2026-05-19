import os
import json
from fastapi import APIRouter, HTTPException
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

@router.get("/")
def get_itineraries():
    return {"message": "Itinerary generator endpoint"}

@router.post("/generate")
def generate_itinerary(config: dict):
    destination = config.get("destination", "Unknown")
    duration = config.get("duration", 3)
    budget = config.get("budget", 1000)
    interests = config.get("interests", [])
    travel_style = config.get("travelStyle", "Balanced")

    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY environment variable is not set. Please add it to your .env file.")

    prompt = f"""
You are an expert travel planner AI. Generate a detailed, highly realistic travel itinerary for {destination} for {duration} days.
The user has a budget of €{budget}, is interested in {', '.join(interests) if interests else 'general tourism'}, and prefers a '{travel_style}' travel style.

You MUST return the output ONLY as valid, minified JSON adhering EXACTLY to this schema. Do not wrap it in markdown code blocks.
{{
  "destination": "{destination}",
  "center": {{ "lat": <float_latitude_of_city>, "lng": <float_longitude_of_city> }},
  "days": [
    {{
      "day_number": <int_day_number>,
      "title": "<string_short_catchy_title_for_the_day>",
      "weather": {{ "temp": <int_estimated_temp_celsius>, "condition": "<string_condition>", "emoji": "<emoji_for_weather>" }},
      "activities": [
        {{
          "name": "<string_name_of_activity>",
          "location": {{ "lat": <float_exact_lat_of_place>, "lng": <float_exact_lng_of_place> }},
          "time": "<string_time_e.g._10:00_AM>",
          "cost": <int_estimated_cost_in_euros_put_0_if_free>,
          "category": "<string_category_e.g._Food_Sightseeing_Museum>"
        }}
      ]
    }}
  ]
}}
Ensure the locations (lat, lng) are real coordinates for actual places in {destination}. Return exactly {duration} days, and 3-5 activities per day. Make the estimated costs fit within the €{budget} budget across the trip.
    """

    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        
        # Clean the response to parse JSON safely
        text_response = response.text.strip()
        if text_response.startswith("```json"):
            text_response = text_response[7:-3]
        elif text_response.startswith("```"):
            text_response = text_response[3:-3]
            
        itinerary_data = json.loads(text_response)
        return itinerary_data
    except Exception as e:
        print(f"Error calling Gemini: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate itinerary with AI.")
