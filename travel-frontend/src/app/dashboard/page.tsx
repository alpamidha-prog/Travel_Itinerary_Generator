'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { Map as MapIcon, Plane, Wallet, ArrowRight, Trash2, Home, Compass, Loader2, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/firebase';
import { collection, query, where, getDocs, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';

interface SavedTrip {
  id: string;
  destination: string;
  duration: number;
  budget: number;
  travelStyle: string;
  interests?: string[];
  createdAt?: any;
}

const getDestinationImage = (destination: string) => {
  const dest = destination.toLowerCase();
  if (dest.includes('paris')) return 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop';
  if (dest.includes('tokyo')) return 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=800&auto=format&fit=crop';
  if (dest.includes('bali')) return 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800&auto=format&fit=crop';
  if (dest.includes('rome')) return 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=800&auto=format&fit=crop';
  if (dest.includes('london')) return 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=800&auto=format&fit=crop';
  if (dest.includes('new york')) return 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=800&auto=format&fit=crop';
  return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800&auto=format&fit=crop';
};

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([]);
  const [tripsLoading, setTripsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch saved itineraries from Firestore once authenticated
  useEffect(() => {
    if (!user) return;
    
    const fetchTrips = async () => {
      setTripsLoading(true);
      try {
        const q = query(
          collection(db, 'itineraries'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const trips: SavedTrip[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          trips.push({
            id: doc.id,
            destination: data.destination,
            duration: data.duration,
            budget: data.budget,
            travelStyle: data.travelStyle,
            interests: data.interests || [],
            createdAt: data.createdAt
          });
        });
        setSavedTrips(trips);
      } catch (error) {
        console.error('Error fetching Firestore itineraries:', error);
      } finally {
        setTripsLoading(false);
      }
    };

    fetchTrips();
  }, [user]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!confirm('Are you sure you want to delete this itinerary?')) return;

    setDeletingId(id);
    try {
      await deleteDoc(doc(db, 'itineraries', id));
      setSavedTrips((prev) => prev.filter((trip) => trip.id !== id));
    } catch (error) {
      console.error('Failed to delete itinerary from Firestore:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col gap-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-gray-500 font-semibold">Verifying session...</p>
      </div>
    );
  }

  // Unauthorized display state
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 max-w-md w-full border border-gray-200 text-center shadow-xl">
          <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600">
            <Compass className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Access Locked</h2>
          <p className="text-gray-500 font-medium mb-8">
            Please log in or register on the home page to access your personal travel dashboard.
          </p>
          <div className="flex flex-col gap-3">
            <Link 
              href="/"
              className="py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Go to Home Page</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate quick analytics from real database entries
  const totalTrips = savedTrips.length;
  const uniqueDestinations = new Set(savedTrips.map(t => t.destination.split(',')[0].trim())).size;
  const totalBudget = savedTrips.reduce((acc, t) => acc + t.budget, 0);

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Your Travel Dashboard</h1>
            <p className="text-gray-500 font-semibold mt-1">Logged in as {user.email}</p>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <Link href="/" className="flex-1 sm:flex-none text-center px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/10">
              Plan New Trip
            </Link>
            <button 
              onClick={handleSignOut}
              className="px-4 py-3 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-2xl transition-colors flex items-center gap-2 cursor-pointer border border-red-100"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Dynamic Real-Time Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mr-6">
              <Plane className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Total Trips</div>
              <div className="text-3xl font-black text-gray-900">{totalTrips}</div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mr-6">
              <MapIcon className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Unique Cities</div>
              <div className="text-3xl font-black text-gray-900">{uniqueDestinations}</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mr-6">
              <Wallet className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Total Planned Budget</div>
              <div className="text-3xl font-black text-gray-900">€{totalBudget}</div>
            </div>
          </div>
        </div>

        {/* Saved Itineraries */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Saved Itineraries</h2>
        
        {tripsLoading ? (
          <div className="flex items-center justify-center py-12 flex-col gap-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-gray-400 font-semibold text-sm">Retrieving your collection...</p>
          </div>
        ) : savedTrips.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-sm max-w-xl mx-auto">
            <Compass className="w-12 h-12 text-gray-300 mx-auto mb-4 animate-bounce" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No itineraries saved yet</h3>
            <p className="text-gray-500 font-medium mb-6">
              Plan your first trip on the homepage and save it to have it appear right here!
            </p>
            <Link 
              href="/"
              className="inline-flex py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all"
            >
              Start Planning Now
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {savedTrips.map(trip => (
              <div 
                key={trip.id} 
                className="bg-white rounded-3xl overflow-hidden shadow-md border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1 group relative cursor-pointer"
                onClick={() => router.push(`/?tripId=${trip.id}`)}
              >
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={getDestinationImage(trip.destination)} 
                    alt={trip.destination} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm">
                    {trip.duration} Days
                  </div>
                  <div className="absolute top-4 left-4 bg-blue-600/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm">
                    {trip.travelStyle}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {trip.destination}
                  </h3>
                  
                  {trip.interests && trip.interests.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 mb-4">
                      {trip.interests.slice(0, 3).map((interest, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-2xs font-semibold uppercase">
                          {interest}
                        </span>
                      ))}
                      {trip.interests.length > 3 && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-400 rounded text-2xs font-semibold">
                          +{trip.interests.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm text-gray-500 font-semibold mb-6 mt-4">
                    <span>Budget: <span className="text-green-600">€{trip.budget}</span></span>
                  </div>
                  
                  <div className="flex gap-3">
                    <button 
                      className="flex-1 bg-blue-50 text-blue-700 font-bold py-2.5 rounded-xl hover:bg-blue-100 transition-colors flex justify-center items-center gap-2 cursor-pointer text-sm"
                    >
                      View Trip <ArrowRight className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => handleDelete(trip.id, e)}
                      disabled={deletingId === trip.id}
                      className="px-3.5 py-2.5 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 border border-red-100 transition-colors cursor-pointer disabled:opacity-50"
                      title="Delete Itinerary"
                    >
                      {deletingId === trip.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
