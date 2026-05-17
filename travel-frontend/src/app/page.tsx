'use client';

import dynamic from 'next/dynamic';

const ItineraryGenerator = dynamic(() => import('@/components/ItineraryGenerator'), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <header className="bg-white/70 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">W</span>
            </div>
            <h1 className="text-xl font-bold text-gray-800">Wanderlust AI</h1>
          </div>
          <nav>
            <button className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Sign In</button>
          </nav>
        </div>
      </header>
      
      <div className="py-12">
        <div className="text-center mb-12 px-4">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Design Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Perfect Trip</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            AI-powered travel itineraries customized to your preferences, budget, and travel style.
          </p>
        </div>
        
        <ItineraryGenerator />
      </div>
    </main>
  );
}
