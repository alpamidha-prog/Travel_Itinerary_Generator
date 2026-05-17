'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface Itinerary {
  destination: string;
  center: { lat: number; lng: number };
  days: {
    day_number: number;
    activities: {
      name: string;
      location: { lat: number; lng: number };
    }[];
  }[];
}

export default function ItineraryGenerator() {
  const [config, setConfig] = useState({
    destination: '',
    duration: 3,
    budget: 1000,
    interests: [] as string[]
  });
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(false);

  const generateItinerary = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await axios.post(
        `${apiUrl}/api/itinerary/generate`,
        config
      );
      setItinerary(response.data);
    } catch (error) {
      console.error('Error generating itinerary:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Input Form */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 p-8 mb-8 transition-all hover:shadow-2xl">
        <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
          Plan Your Trip
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
                <input 
                    type="text" 
                    value={config.destination}
                    onChange={(e) => setConfig({...config, destination: e.target.value})}
                    placeholder="E.g. Paris, France"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (Days)</label>
                <input 
                    type="number" 
                    value={config.duration}
                    onChange={(e) => setConfig({...config, duration: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
                />
            </div>
        </div>
        <button 
          onClick={generateItinerary}
          disabled={loading}
          className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Generating Magic...' : 'Generate Itinerary'}
        </button>
      </div>

      {/* Map & Itinerary Display */}
      {itinerary && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-1 h-[600px]">
                    <MapContainer 
                        center={[itinerary.center.lat, itinerary.center.lng]} 
                        zoom={12}
                        className="h-full w-full rounded-xl"
                    >
                        <TileLayer 
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
                        />
                        {itinerary.days.map((day) =>
                        day.activities.map((activity, idx) => (
                            <Marker 
                            key={`${day.day_number}-${idx}`}
                            position={[activity.location.lat, activity.location.lng]}
                            >
                                <Popup>{activity.name}</Popup>
                            </Marker>
                        ))
                        )}
                    </MapContainer>
                </div>
            </div>

          <div className="lg:col-span-5 space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {itinerary.days.map((day, idx) => (
                <div key={idx} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">Day {day.day_number}</span>
                    </h3>
                    <div className="space-y-4">
                        {day.activities.map((activity, aIdx) => (
                            <div key={aIdx} className="flex items-start p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
                                <div>
                                    <h4 className="font-medium text-gray-800">{activity.name}</h4>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
