'use client';

import dynamic from 'next/dynamic';
import { Compass, Map as MapIcon, Plane, Sparkles, Navigation, Wallet } from 'lucide-react';

const ItineraryGenerator = dynamic(() => import('@/components/ItineraryGenerator'), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Compass className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">Wanderlust AI</h1>
          </div>
          <nav className="flex items-center gap-6">
            <a href="/dashboard" className="text-gray-600 hover:text-blue-600 font-semibold transition-colors">Dashboard</a>
            <button className="px-6 py-2 rounded-full text-blue-600 hover:bg-blue-50 font-semibold transition-colors">Sign In</button>
          </nav>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 to-indigo-900 text-white py-24 lg:py-32">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
              <Sparkles className="w-4 h-4 text-blue-300" />
              <span className="text-sm font-medium text-blue-100">Your AI Travel Companion</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight leading-tight">
              From Dreams to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Itineraries</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-2xl mx-auto font-light">
              Design your perfect trip in seconds. AI-powered travel planning customized to your exact preferences, budget, and style.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#generator" className="px-8 py-4 bg-white text-blue-900 rounded-full font-bold text-lg hover:bg-blue-50 transition-colors shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)]">
                Plan Your Trip Now
              </a>
              <a href="#examples" className="px-8 py-4 bg-transparent border border-white/30 text-white rounded-full font-bold text-lg hover:bg-white/10 transition-colors">
                See Examples
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Enter Destination', desc: 'Tell us where you want to go', icon: MapIcon },
              { step: '2', title: 'Set Preferences', desc: 'Define your budget and travel style', icon: Sparkles },
              { step: '3', title: 'AI Generates', desc: 'Our AI crafts the perfect route', icon: Navigation },
              { step: '4', title: 'Start Adventure', desc: 'Export your itinerary and travel', icon: Plane }
            ].map((item, idx) => (
              <div key={idx} className="relative text-center group">
                <div className="w-20 h-20 mx-auto bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-300 shadow-sm border border-blue-100">
                  <item.icon className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
                {idx < 3 && <div className="hidden md:block absolute top-10 right-0 w-full h-[2px] bg-gradient-to-r from-blue-100 to-transparent translate-x-1/2"></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Why Choose Wanderlust AI?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Recommendations</h3>
              <p className="text-gray-600">ML-powered suggestions tailored perfectly to your unique interests and travel style.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                <Wallet className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Budget Optimization</h3>
              <p className="text-gray-600">Get the absolute most value for your money with smart cost tracking and predictions.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <MapIcon className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Route Optimization</h3>
              <p className="text-gray-600">Save hours of transit time with optimized daily routes mapped out intuitively.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Generator Section */}
      <section id="generator" className="py-20 bg-white relative">
        <div className="absolute inset-0 bg-blue-50/50 transform -skew-y-2 z-0"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Start Planning</h2>
            <p className="text-xl text-gray-600">Let the AI do the heavy lifting.</p>
          </div>
          <ItineraryGenerator />
        </div>
      </section>

      {/* Example Itineraries */}
      <section id="examples" className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">Popular Generated Trips</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: '3 Days in Paris', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop', cost: '€800', type: 'Romantic' },
              { title: 'Week in Tokyo', image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=800&auto=format&fit=crop', cost: '€1,500', type: 'Cultural' },
              { title: 'Bali Adventure', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800&auto=format&fit=crop', cost: '€600', type: 'Relaxation' }
            ].map((trip, idx) => (
              <div key={idx} className="group rounded-3xl overflow-hidden cursor-pointer relative aspect-[4/5]">
                <img src={trip.image} alt={trip.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                  <div className="mb-2 flex gap-2">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold">{trip.cost}</span>
                    <span className="px-3 py-1 bg-blue-600/80 backdrop-blur-md rounded-full text-xs font-semibold">{trip.type}</span>
                  </div>
                  <h3 className="text-2xl font-bold">{trip.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}
