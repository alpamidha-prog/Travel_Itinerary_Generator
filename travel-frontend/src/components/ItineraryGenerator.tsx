'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/firebase';

// Fix for default marker icons in Next.js
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then((mod) => mod.Polyline), { ssr: false });

interface Activity {
  name: string;
  location: { lat: number; lng: number };
  time?: string;
  cost?: number;
  category?: string;
}

interface Itinerary {
  destination: string;
  center: { lat: number; lng: number };
  days: {
    day_number: number;
    title?: string;
    weather?: { temp: number, condition: string, emoji: string };
    activities: Activity[];
  }[];
}

const INTERESTS = ['Art', 'Food', 'History', 'Nature', 'Adventure', 'Shopping', 'Nightlife'];
const STYLES = ['Relaxed', 'Balanced', 'Packed'];
const DAY_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];
const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function ItineraryGenerator() {
  const [config, setConfig] = useState({
    destination: '',
    duration: 3,
    budget: 1000,
    interests: [] as string[],
    travelStyle: 'Balanced'
  });
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Save State Management
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Handle rehydrating dynamic saved trip from URL search params on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const tripId = searchParams.get('tripId');
      if (tripId) {
        const loadTrip = async () => {
          setLoading(true);
          try {
            const docRef = doc(db, 'itineraries', tripId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              const data = docSnap.data();
              setItinerary({
                destination: data.destination,
                center: data.center,
                days: data.days
              });
              setConfig({
                destination: data.destination,
                duration: data.duration || 3,
                budget: data.budget || 1000,
                interests: data.interests || [],
                travelStyle: data.travelStyle || 'Balanced'
              });
            } else {
              console.error('Trip does not exist in Firestore!');
            }
          } catch (err) {
            console.error('Failed to load trip from Firestore:', err);
          } finally {
            setLoading(false);
          }
        };
        loadTrip();
      }
    }
  }, []);

  const toggleInterest = (interest: string) => {
    setConfig(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const generateItinerary = async () => {
    setLoading(true);
    setSaveSuccess(false);
    setSaveError('');
    try {
      let apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        apiUrl = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
          ? ''
          : 'http://localhost:8000';
      }
      const response = await axios.post(`${apiUrl}/api/itinerary/generate`, config);
      
      // Enrich backend data with mock details for UI demonstration if missing
      const data: Itinerary = response.data;
      data.days.forEach(day => {
        if (!day.title) day.title = "Discovering the City";
        if (!day.weather) day.weather = { temp: Math.floor(Math.random() * 15) + 15, condition: 'Sunny', emoji: '☀️' };
        day.activities.forEach((act, idx) => {
          if (!act.time) act.time = idx === 0 ? "10:00 AM" : "02:00 PM";
          if (!act.cost) act.cost = Math.floor(Math.random() * 30) + 10;
          if (!act.category) act.category = "Exploration";
        });
      });
      
      setItinerary(data);
      // Remove any tripId parameter from URL when generating a new itinerary
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, '', '/');
      }
    } catch (error) {
      console.error('Error generating itinerary:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveItinerary = async () => {
    if (!auth.currentUser) {
      alert('Please Sign In first to save itineraries to your dashboard!');
      return;
    }
    if (!itinerary) return;

    setSaving(true);
    setSaveError('');
    try {
      await addDoc(collection(db, 'itineraries'), {
        userId: auth.currentUser.uid,
        destination: itinerary.destination,
        center: itinerary.center,
        days: itinerary.days,
        duration: config.duration,
        budget: config.budget,
        travelStyle: config.travelStyle,
        interests: config.interests,
        createdAt: serverTimestamp()
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Firestore save failed:', err);
      setSaveError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Generate fake cost breakdown based on budget
  const costData = itinerary ? [
    { name: 'Accommodation', value: Math.floor(config.budget * 0.4) },
    { name: 'Food', value: Math.floor(config.budget * 0.25) },
    { name: 'Activities', value: Math.floor(config.budget * 0.2) },
    { name: 'Transportation', value: Math.floor(config.budget * 0.15) }
  ] : [];

  return (
    <div className="max-w-7xl mx-auto">

      {/* Input Form */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          
          {/* Destination */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Where to?</label>
            <input 
              type="text" 
              value={config.destination}
              onChange={(e) => setConfig({...config, destination: e.target.value})}
              placeholder="E.g. Paris, France"
              className="w-full px-5 py-4 bg-slate-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-lg"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Duration (Days)</label>
            <input 
              type="number" 
              min={1} max={14}
              value={config.duration}
              onChange={(e) => setConfig({...config, duration: parseInt(e.target.value) || 1})}
              className="w-full px-5 py-4 bg-slate-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-lg"
            />
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-4 flex justify-between">
              <span>Budget</span>
              <span className="text-blue-600">€{config.budget}</span>
            </label>
            <input 
              type="range" 
              min="100" max="5000" step="100"
              value={config.budget}
              onChange={(e) => setConfig({...config, budget: parseInt(e.target.value)})}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
              <span>€100</span>
              <span>€5000</span>
            </div>
          </div>

          {/* Travel Style */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Travel Style</label>
            <div className="grid grid-cols-3 gap-3">
              {STYLES.map(style => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setConfig({...config, travelStyle: style})}
                  className={`py-3 rounded-xl font-semibold text-sm transition-all ${
                    config.travelStyle === style 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' 
                      : 'bg-slate-50 text-gray-600 hover:bg-slate-100 border border-gray-200'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-3">What interests you?</label>
            <div className="flex flex-wrap gap-3">
              {INTERESTS.map(interest => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                    config.interests.includes(interest)
                      ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-500 shadow-sm'
                      : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-indigo-300 hover:bg-slate-50'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-100 flex justify-center">
          <button 
            onClick={generateItinerary}
            disabled={loading || !config.destination}
            className="w-full md:w-2/3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-xl shadow-blue-500/20 transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center gap-3"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Crafting Your Itinerary...
              </>
            ) : (
              '✨ Generate Magic Itinerary'
            )}
          </button>
        </div>
      </div>

      {/* Map & Itinerary Display */}
      {itinerary && (
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <span>✈️</span> Trip to {itinerary.destination}
            </h2>
            <p className="text-gray-500 font-semibold mt-1">
              {config.duration} Days • {config.travelStyle} Style • €{config.budget} Budget
            </p>
          </div>
          <div className="flex flex-col items-stretch md:items-end gap-2 w-full md:w-auto">
            <button 
              onClick={saveItinerary}
              disabled={saving}
              className={`px-8 py-3.5 rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                saveSuccess 
                  ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-500/20' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/20'
              }`}
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : saveSuccess ? (
                '✅ Saved Successfully!'
              ) : (
                '💾 Save to Dashboard'
              )}
            </button>
            {saveError && <p className="text-red-500 text-xs font-semibold">{saveError}</p>}
          </div>
        </div>
      )}

      {itinerary && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
          {/* Left Column: Map & Analytics */}
          <div className="lg:col-span-7 lg:order-2 space-y-6">
              
              {/* Analytics & Cost Breakdown */}
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Budget Breakdown (€{config.budget})</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={costData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                      >
                        {costData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `€${value}`} />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Map Section */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-2 h-[500px] lg:h-[600px] sticky top-24">
                  <MapContainer 
                      center={[itinerary.center.lat, itinerary.center.lng]} 
                      zoom={12}
                      className="h-full w-full rounded-2xl z-0"
                  >
                      <TileLayer 
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" 
                      />
                      {itinerary.days.map((day, dIdx) => (
                          <div key={`day-path-${dIdx}`}>
                              <Polyline 
                                  positions={day.activities.map(a => [a.location.lat, a.location.lng])}
                                  color={DAY_COLORS[dIdx % DAY_COLORS.length]}
                                  weight={4}
                                  dashArray="5, 10"
                              />
                              {day.activities.map((activity, aIdx) => (
                                  <Marker 
                                      key={`marker-${dIdx}-${aIdx}`}
                                      position={[activity.location.lat, activity.location.lng]}
                                  >
                                      <Popup>
                                          <div className="p-1">
                                              <strong className="block text-base mb-1">{activity.name}</strong>
                                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Day {day.day_number}</span>
                                          </div>
                                      </Popup>
                                  </Marker>
                              ))}
                          </div>
                      ))}
                  </MapContainer>
              </div>
          </div>

          {/* Timeline Section */}
          <div className="lg:col-span-5 lg:order-1 space-y-8">
            {itinerary.days.map((day, idx) => (
                <div key={idx} className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden group">
                    <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-blue-600 font-bold tracking-wide uppercase text-sm mb-1">Day {day.day_number}</h3>
                                <h4 className="text-xl font-extrabold text-gray-900">{day.title}</h4>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl mb-1">{day.weather?.emoji}</div>
                                <div className="text-sm font-semibold text-gray-600">{day.weather?.temp}°C</div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-6 space-y-6">
                        {day.activities.map((activity, aIdx) => (
                            <div key={aIdx} className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className="w-3 h-3 rounded-full mt-2" style={{backgroundColor: DAY_COLORS[idx % DAY_COLORS.length]}}></div>
                                    {aIdx < day.activities.length - 1 && <div className="w-0.5 h-full bg-gray-200 mt-2"></div>}
                                </div>
                                <div className="flex-1 bg-slate-50 rounded-2xl p-4 border border-gray-100 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <h5 className="font-bold text-gray-900 text-lg leading-tight">{activity.name}</h5>
                                        {activity.cost ? <span className="font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-md text-sm whitespace-nowrap ml-2">€{activity.cost}</span> : null}
                                    </div>
                                    <div className="flex flex-wrap gap-2 text-xs font-medium text-gray-500 mt-3">
                                        {activity.time && <span className="flex items-center gap-1"><span className="text-base">🕒</span> {activity.time}</span>}
                                        {activity.category && <span className="flex items-center gap-1"><span className="text-base">📍</span> {activity.category}</span>}
                                    </div>
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
