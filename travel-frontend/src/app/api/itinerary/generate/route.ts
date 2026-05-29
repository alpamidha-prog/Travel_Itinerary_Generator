import { NextResponse } from 'next/server';

interface Activity {
  name: string;
  location: { lat: number; lng: number };
  time: string;
  cost: number;
  category: string;
}

interface Day {
  day_number: number;
  title: string;
  weather: { temp: number; condition: string; emoji: string };
  activities: Activity[];
}

function getMockItinerary(destination: string, duration: number, budget: number, interests: string[], travelStyle: string) {
  const destLower = destination.toLowerCase();
  let center = { lat: 41.9028, lng: 12.4964 }; // Rome fallback
  let allDays: Day[] = [];

  if (destLower.includes("paris")) {
    center = { lat: 48.8566, lng: 2.3522 };
    allDays = [
      {
        day_number: 1,
        title: "Iconic Paris Landmarks",
        weather: { temp: 18, condition: "Sunny", emoji: "☀️" },
        activities: [
          { name: "Eiffel Tower", location: { lat: 48.8584, lng: 2.2945 }, time: "10:00 AM", cost: 25, category: "Sightseeing" },
          { name: "Louvre Museum", location: { lat: 48.8606, lng: 2.3376 }, time: "02:00 PM", cost: 22, category: "Museum" },
          { name: "Seine River Cruise", location: { lat: 48.8566, lng: 2.3522 }, time: "06:00 PM", cost: 15, category: "Sightseeing" }
        ]
      },
      {
        day_number: 2,
        title: "Art and Culture",
        weather: { temp: 17, condition: "Partly Cloudy", emoji: "⛅" },
        activities: [
          { name: "Musée d'Orsay", location: { lat: 48.8599, lng: 2.3265 }, time: "10:00 AM", cost: 16, category: "Museum" },
          { name: "Jardin du Luxembourg", location: { lat: 48.8462, lng: 2.3371 }, time: "01:30 PM", cost: 0, category: "Nature" },
          { name: "Notre-Dame Cathedral", location: { lat: 48.8530, lng: 2.3499 }, time: "04:00 PM", cost: 5, category: "History" }
        ]
      },
      {
        day_number: 3,
        title: "Montmartre & Shopping",
        weather: { temp: 19, condition: "Sunny", emoji: "☀️" },
        activities: [
          { name: "Sacré-Cœur Basilica", location: { lat: 48.8867, lng: 2.3431 }, time: "10:30 AM", cost: 0, category: "History" },
          { name: "Place du Tertre", location: { lat: 48.8865, lng: 2.3408 }, time: "01:00 PM", cost: 10, category: "Art" },
          { name: "Champs-Élysées", location: { lat: 48.8698, lng: 2.3078 }, time: "04:30 PM", cost: 20, category: "Shopping" }
        ]
      }
    ];
  } else if (destLower.includes("tokyo")) {
    center = { lat: 35.6762, lng: 139.6503 };
    allDays = [
      {
        day_number: 1,
        title: "Historic Asakusa & Skytree",
        weather: { temp: 22, condition: "Sunny", emoji: "☀️" },
        activities: [
          { name: "Senso-ji Temple", location: { lat: 35.7148, lng: 139.7967 }, time: "09:30 AM", cost: 0, category: "History" },
          { name: "Nakamise Shopping Street", location: { lat: 35.7138, lng: 139.7966 }, time: "11:30 AM", cost: 15, category: "Shopping" },
          { name: "Tokyo Skytree", location: { lat: 35.7101, lng: 139.8107 }, time: "03:00 PM", cost: 25, category: "Sightseeing" },
          { name: "Ueno Park", location: { lat: 35.7141, lng: 139.7741 }, time: "06:00 PM", cost: 0, category: "Nature" }
        ]
      },
      {
        day_number: 2,
        title: "Modern Shibuya & Harajuku",
        weather: { temp: 20, condition: "Cloudy", emoji: "☁️" },
        activities: [
          { name: "Meiji Jingu Shrine", location: { lat: 35.6764, lng: 139.6993 }, time: "10:00 AM", cost: 0, category: "History" },
          { name: "Takeshita Street", location: { lat: 35.6702, lng: 139.7049 }, time: "01:00 PM", cost: 20, category: "Shopping" },
          { name: "Shibuya Crossing", location: { lat: 35.6580, lng: 139.7016 }, time: "05:00 PM", cost: 0, category: "Sightseeing" },
          { name: "Shinjuku Golden Gai", location: { lat: 35.6938, lng: 139.7043 }, time: "08:00 PM", cost: 35, category: "Nightlife" }
        ]
      },
      {
        day_number: 3,
        title: "Tech, Markets & Art",
        weather: { temp: 21, condition: "Sunny", emoji: "☀️" },
        activities: [
          { name: "Tsukiji Outer Market", location: { lat: 35.6655, lng: 139.7702 }, time: "09:00 AM", cost: 30, category: "Food" },
          { name: "teamLab Planets", location: { lat: 35.6489, lng: 139.7898 }, time: "01:00 PM", cost: 28, category: "Art" },
          { name: "Odaiba Seaside Park", location: { lat: 35.6288, lng: 139.7753 }, time: "05:00 PM", cost: 5, category: "Relaxation" }
        ]
      }
    ];
  } else {
    // Rome or Fallback
    center = { lat: 41.9028, lng: 12.4964 };
    allDays = [
      {
        day_number: 1,
        title: "Ancient Rome Exploration",
        weather: { temp: 24, condition: "Sunny", emoji: "☀️" },
        activities: [
          { name: "The Colosseum", location: { lat: 41.8902, lng: 12.4922 }, time: "09:00 AM", cost: 18, category: "History" },
          { name: "Roman Forum", location: { lat: 41.8925, lng: 12.4853 }, time: "12:00 PM", cost: 10, category: "History" },
          { name: "Trevi Fountain", location: { lat: 41.9009, lng: 12.4833 }, time: "04:30 PM", cost: 0, category: "Sightseeing" },
          { name: "Piazza Navona", location: { lat: 41.8989, lng: 12.4731 }, time: "07:30 PM", cost: 15, category: "Food" }
        ]
      },
      {
        day_number: 2,
        title: "Vatican City & Art",
        weather: { temp: 23, condition: "Sunny", emoji: "☀️" },
        activities: [
          { name: "Vatican Museums", location: { lat: 41.9065, lng: 12.4536 }, time: "09:30 AM", cost: 22, category: "Museum" },
          { name: "St. Peter's Basilica", location: { lat: 41.9022, lng: 12.4539 }, time: "01:30 PM", cost: 0, category: "History" },
          { name: "Castel Sant'Angelo", location: { lat: 41.9031, lng: 12.4663 }, time: "04:30 PM", cost: 12, category: "Sightseeing" }
        ]
      },
      {
        day_number: 3,
        title: "Pantheon & Borghese Gardens",
        weather: { temp: 25, condition: "Clear", emoji: "☀️" },
        activities: [
          { name: "The Pantheon", location: { lat: 41.8986, lng: 12.4769 }, time: "10:00 AM", cost: 5, category: "History" },
          { name: "Villa Borghese Gardens", location: { lat: 41.9131, lng: 12.4862 }, time: "01:00 PM", cost: 0, category: "Nature" },
          { name: "Spanish Steps", location: { lat: 41.9059, lng: 12.4828 }, time: "04:30 PM", cost: 0, category: "Sightseeing" }
        ]
      }
    ];
  }

  // Adjust days to requested duration
  const days: Day[] = allDays.slice(0, duration);
  while (days.length < duration) {
    const baseDay = allDays[days.length % allDays.length];
    const newDay = JSON.parse(JSON.stringify(baseDay));
    newDay.day_number = days.length + 1;
    days.push(newDay);
  }

  return {
    destination,
    center,
    days
  };
}

export async function POST(request: Request) {
  try {
    const config = await request.json();
    const destination = config.destination || "Unknown";
    const duration = config.duration || 3;
    const budget = config.budget || 1000;
    const interests = config.interests || [];
    const travelStyle = config.travelStyle || "Balanced";

    // Read Gemini API key from environment variables
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn("GEMINI_API_KEY environment variable is not set. Falling back to mock data.");
      const mockData = getMockItinerary(destination, duration, budget, interests, travelStyle);
      return NextResponse.json(mockData);
    }

    const prompt = `
You are an expert travel planner AI. Generate a detailed, highly realistic travel itinerary for ${destination} for ${duration} days.
The user has a budget of €${budget}, is interested in ${interests.length > 0 ? interests.join(', ') : 'general tourism'}, and prefers a '${travelStyle}' travel style.

You MUST return the output ONLY as valid, minified JSON adhering EXACTLY to this schema. Do not wrap it in markdown code blocks.
{
  "destination": "${destination}",
  "center": { "lat": <float_latitude_of_city>, "lng": <float_longitude_of_city> },
  "days": [
    {
      "day_number": <int_day_number>,
      "title": "<string_short_catchy_title_for_the_day>",
      "weather": { "temp": <int_estimated_temp_celsius>, "condition": "<string_condition>", "emoji": "<emoji_for_weather>" },
      "activities": [
        {
          "name": "<string_name_of_activity>",
          "location": { "lat": <float_exact_lat_of_place>, "lng": <float_exact_lng_of_place> },
          "time": "<string_time_e.g._10:00_AM>",
          "cost": <int_estimated_cost_in_euros_put_0_if_free>,
          "category": "<string_category_e.g._Food_Sightseeing_Museum>"
        }
      ]
    }
  ]
}
Ensure the locations (lat, lng) are real coordinates for actual places in ${destination}. Return exactly ${duration} days, and 3-5 activities per day. Make the estimated costs fit within the €${budget} budget across the trip.
    `;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API returned status ${response.status}`);
      }

      const rawResult = await response.json();
      const geminiText = rawResult.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!geminiText) {
        throw new Error("No response text returned from Gemini API");
      }

      // Clean markdown styling if Gemini outputs it
      let textResponse = geminiText.trim();
      if (textResponse.startsWith("```json")) {
        textResponse = textResponse.substring(7, textResponse.length - 3);
      } else if (textResponse.startsWith("```")) {
        textResponse = textResponse.substring(3, textResponse.length - 3);
      }

      const itineraryData = JSON.parse(textResponse.trim());
      return NextResponse.json(itineraryData);
    } catch (apiError: any) {
      console.error(`Error calling Gemini API: ${apiError.message}. Falling back to mock data.`);
      const mockData = getMockItinerary(destination, duration, budget, interests, travelStyle);
      return NextResponse.json(mockData);
    }
  } catch (error: any) {
    console.error("Handler error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
