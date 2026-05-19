'use client';

import { Map as MapIcon, Plane, Wallet, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const savedTrips = [
    { id: 1, destination: 'Paris, France', duration: 3, budget: 1000, image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop' },
    { id: 2, destination: 'Tokyo, Japan', duration: 7, budget: 2500, image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=800&auto=format&fit=crop' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900">Your Travel Dashboard</h1>
          <Link href="/" className="px-6 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors">
            Plan New Trip
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mr-6">
              <Plane className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <div className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">Total Trips</div>
              <div className="text-4xl font-black text-gray-900">12</div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mr-6">
              <MapIcon className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <div className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">Countries</div>
              <div className="text-4xl font-black text-gray-900">8</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mr-6">
              <Wallet className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <div className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">Money Saved</div>
              <div className="text-4xl font-black text-gray-900">€420</div>
            </div>
          </div>
        </div>

        {/* Saved Itineraries */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Saved Itineraries</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {savedTrips.map(trip => (
            <div key={trip.id} className="bg-white rounded-3xl overflow-hidden shadow-md border border-gray-100 hover:shadow-xl transition-shadow group cursor-pointer">
              <div className="h-48 overflow-hidden relative">
                <img src={trip.image} alt={trip.destination} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800">
                  {trip.duration} Days
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{trip.destination}</h3>
                <div className="flex justify-between items-center text-sm text-gray-500 font-medium mb-6">
                  <span>Budget: €{trip.budget}</span>
                </div>
                <div className="flex gap-3">
                  <button className="flex-1 bg-blue-50 text-blue-700 font-semibold py-2 rounded-xl hover:bg-blue-100 transition-colors flex justify-center items-center gap-2">
                    View <ArrowRight className="w-4 h-4" />
                  </button>
                  <button className="px-4 py-2 bg-slate-50 text-slate-600 font-semibold rounded-xl hover:bg-slate-100 border border-slate-200 transition-colors">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
