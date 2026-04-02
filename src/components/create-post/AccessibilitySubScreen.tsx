import { Trash2 } from 'lucide-react';
import { parseFilter } from '../../utils/styleUtils';

interface AccessibilitySubScreenProps {
  mediaFiles: Array<{ url: string; file: File; type: string; filter?: string }>;
  altTextMap: Record<number, string>;
  setAltTextMap: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  onRemoveFile: (index: number) => void;
  onClose: () => void;
}

export default function AccessibilitySubScreen({ 
  mediaFiles, 
  altTextMap, 
  setAltTextMap, 
  onRemoveFile, 
  onClose 
}: AccessibilitySubScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-neutral-900 border border-white/10 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button type="button" onClick={onClose} className="text-white hover:text-gray-300" aria-label="Go back">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="font-bold text-lg">Accessibility</h2>
          </div>
          <button type="button" onClick={onClose} className="text-blue-400 font-bold hover:text-blue-300">Done</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <p className="text-gray-400 text-sm">Alt text describes your photos for people with visual impairments. It will be created automatically if you don't write it yourself.</p>
          {mediaFiles.map((item, idx) => {
            const { className, style } = parseFilter(item.filter);
            return (
              <div key={idx} className="flex gap-4">
                <div className="w-16 h-16 rounded-md overflow-hidden shrink-0 border border-white/10 relative group">
                  {item.type === 'video' ? (
                    <video src={item.url} className={`w-full h-full object-cover ${className}`} style={style} muted />
                  ) : (
                    <img src={item.url} alt="" className={`w-full h-full object-cover ${className}`} style={style} />
                  )}
                  <button type="button"
                    onClick={() => onRemoveFile(idx)}
                    aria-label="Remove media"
                    className="absolute top-1 right-1 w-6 h-6 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white/90 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/80 hover:scale-110 active:scale-95 z-10 border border-white/5"
                  >
                    <Trash2 size={12} strokeWidth={2.5} />
                  </button>
                </div>
                <div className="flex-1">
                  <input 
                    type="text" 
                    value={altTextMap[idx] || ''}
                    onChange={(e) => setAltTextMap(prev => ({...prev, [idx]: e.target.value}))}
                    placeholder="Write alt text..." 
                    className="w-full bg-neutral-800 border border-white/10 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
