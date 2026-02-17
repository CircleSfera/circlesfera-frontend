import { Music as MusicIcon, X } from 'lucide-react';
import Carousel from '../Carousel';
import type { CreateMode, MediaFile, SubScreen } from '../../hooks/useCreatePost';
import type { Audio as AudioTrack } from '../../types';
import { useAuthStore } from '../../stores/authStore';

interface CaptionStepProps {
  mediaFiles: MediaFile[];
  mode: CreateMode;
  caption: string;
  setCaption: (caption: string) => void;
  location: string;
  setSubScreen: (screen: SubScreen) => void;
  selectedAudio: AudioTrack | null;
  setSelectedAudio: (audio: AudioTrack | null) => void; // Changed to accept null
  setShowMusicPicker: (show: boolean) => void;
}

export default function CaptionStep({
  mediaFiles,
  mode,
  caption,
  setCaption,
  location,
  setSubScreen,
  selectedAudio,
  setSelectedAudio,
  setShowMusicPicker,
}: CaptionStepProps) {
  const { profile } = useAuthStore();

  return (
    <div className="flex flex-col md:flex-row h-full">
      <div className="w-full md:w-1/2 bg-zinc-950 flex items-center justify-center border-b md:border-b-0 md:border-r border-white/5 p-8 relative">
        <div className="absolute inset-0 bg-radial-[at_50%_50%] from-blue-500/5 via-transparent to-transparent" />
        <div className={`relative w-full ${mode === 'POST' ? 'max-w-[300px] aspect-4/5' : 'max-w-[240px] aspect-9/16'} bg-black rounded-xl border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl transition-all duration-300 z-10`}>
           <Carousel 
              media={mediaFiles.map(m => ({ id: m.url, url: m.url, type: m.type, filter: m.filter }))} 
              aspectRatio={mode === 'POST' ? 'aspect-4/5' : 'aspect-9/16'}
              objectFit="cover"
           />
         </div>
      </div>
      <div className="w-full md:w-1/2 p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-neutral-800">
            {profile?.avatar ? (
                <img src={profile.avatar} alt={profile.username} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full bg-linear-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white">
                    {profile?.username?.[0]?.toUpperCase() || 'U'}
                </div>
            )}
          </div>
          <span className="font-bold text-sm">{profile?.username || 'You'}</span>
        </div>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Write a caption..."
          className="w-full h-40 bg-transparent text-white border-0 resize-none focus:ring-0 placeholder-gray-500 text-base outline-none"
        />
        <div className="text-gray-500 text-sm border-t border-white/10 pt-4 space-y-2">
          <button type="button" onClick={() => setSubScreen('location')} className="w-full flex justify-between items-center py-3 px-3 hover:bg-white/5 cursor-pointer rounded-lg transition-colors group">
            <span className={`text-white/90 group-hover:text-white transition-colors ${location ? 'text-blue-400 font-medium' : ''}`}>
                {location || 'Add location'}
            </span>
            <svg className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button type="button" onClick={() => setSubScreen('accessibility')} className="w-full flex justify-between items-center py-3 px-3 hover:bg-white/5 cursor-pointer rounded-lg transition-colors group">
            <span className="text-white/90 group-hover:text-white transition-colors">Accessibility</span>
            <svg className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button type="button" onClick={() => setSubScreen('advanced')} className="w-full flex justify-between items-center py-3 px-3 hover:bg-white/5 cursor-pointer rounded-lg transition-colors group">
            <span className="text-white/90 group-hover:text-white transition-colors">Advanced Settings</span>
            <svg className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button type="button" onClick={() => setShowMusicPicker(true)} className="w-full flex justify-between items-center py-3 px-3 hover:bg-white/5 cursor-pointer rounded-lg transition-colors group">
            <div className="flex items-center gap-2">
              <MusicIcon size={18} className={selectedAudio ? 'text-blue-400' : 'text-gray-500'} />
              <span className={`text-white/90 group-hover:text-white transition-colors ${selectedAudio ? 'text-blue-400 font-medium' : ''}`}>
                {selectedAudio ? `${selectedAudio.title} - ${selectedAudio.artist}` : 'Add Music'}
              </span>
            </div>
            {selectedAudio && (
              <button type="button" 
                onClick={(e) => { e.stopPropagation(); setSelectedAudio(null); }}
                className="text-gray-500 hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
