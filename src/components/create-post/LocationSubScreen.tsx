import React from 'react';

interface LocationSubScreenProps {
  onClose: () => void;
  onSelect: (location: string) => void;
}

export default function LocationSubScreen({ onClose, onSelect }: LocationSubScreenProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  
  const locations = ['New York, USA', 'London, UK', 'Paris, France', 'Tokyo, Japan', 'Dubai, UAE'];
  const filteredLocations = locations.filter(loc => 
    loc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-neutral-900 border border-white/10 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[600px]">
        <div className="p-4 border-b border-white/10 flex items-center gap-4">
          <button type="button" onClick={onClose} className="text-white hover:text-gray-300">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="font-bold text-lg">Add Location</h2>
        </div>
        <div className="p-4">
          <div className="relative">
            <svg className="absolute left-3 top-3 w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Find a location" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-800 border-none rounded-lg py-2.5 pl-10 text-white placeholder-gray-500 focus:ring-1 focus:ring-white/20"
              autoFocus
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredLocations.length > 0 ? (
            filteredLocations.map(loc => (
              <button type="button" 
                key={loc}
                onClick={() => onSelect(loc)}
                className="w-full text-left px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-0"
              >
                <div className="font-medium text-white">{loc}</div>
                <div className="text-xs text-gray-500">Popular Location</div>
              </button>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              No locations found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
