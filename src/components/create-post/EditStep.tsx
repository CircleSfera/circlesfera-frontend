import type { MutableRefObject } from 'react';
import { Trash2 } from 'lucide-react';
import Carousel from '../Carousel';
import { parseFilter } from '../../utils/styleUtils';
import type { CreateMode, MediaFile } from '../../hooks/useCreatePost';

interface EditStepProps {
  mediaFiles: MediaFile[];
  mode: CreateMode;
  setMode: (mode: CreateMode) => void;
  setCurrentEditIndex: (index: number | null) => void;
  handleRemoveFile: (index: number) => void;
  fileInputRef: MutableRefObject<HTMLInputElement | null>;
}

export default function EditStep({
  mediaFiles,
  mode,
  setMode,
  setCurrentEditIndex,
  handleRemoveFile,
  fileInputRef,
}: EditStepProps) {

  return (
    <div className="flex-1 bg-black flex flex-col h-full w-full overflow-hidden">
      {/* Main Preview (Carousel style) */}
      <div className="flex-1 relative bg-zinc-950 flex items-center justify-center overflow-hidden p-6 min-h-0">
        <div className={`relative w-auto h-full max-h-full max-w-full flex items-center justify-center overflow-hidden rounded-xl shadow-2xl transition-all duration-300 ${mode === 'POST' ? 'aspect-4/5' : 'aspect-9/16'}`}>
             <Carousel 
                media={mediaFiles.map(m => ({ id: m.url, url: m.url, type: m.type, filter: m.filter }))}
                aspectRatio={mode === 'POST' ? 'aspect-4/5' : 'aspect-9/16'}
                objectFit="cover"
                className="w-full h-full"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                   onClick={() => setCurrentEditIndex(0)}
              >
                <div className="bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 pointer-events-none">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit
                </div>
              </div>
        </div>
      </div>
      
      {/* Mode Switcher (In Edit Mode) */}
       <div className="p-3 bg-black border-t border-white/10 flex justify-center gap-8 z-10">
          {(['POST', 'STORY', 'FRAME'] as const).map((m) => (
              <button type="button"
                key={m}
                onClick={() => setMode(m)}
                className={`text-sm font-bold tracking-wider transition-colors ${mode === m ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
              >
                  {m}
              </button>
          ))}
       </div>
      
      {/* Thumbnails list to pick for editing */}
      <div className="h-24 bg-black border-t border-white/10 flex items-center px-4 gap-4 overflow-x-auto shrink-0">
         {mediaFiles.map((item, idx) => (
             <div key={idx} className="relative w-16 h-16 rounded-md overflow-hidden border border-white/20 hover:border-white transition-colors group shrink-0">
               {(() => {
                   const { className, style } = parseFilter(item.filter);
                   return (
                       <img 
                           src={item.url} 
                           className={`w-full h-full object-cover cursor-pointer ${className}`}
                           style={style}
                           alt="" 
                           onClick={() => setCurrentEditIndex(idx)}
                       />
                   );
               })()}
               <button type="button"
                 onClick={(e) => {
                   e.stopPropagation();
                   handleRemoveFile(idx);
                 }}
                 className="absolute top-1 right-1 w-6 h-6 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white/90 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/80 hover:scale-110 active:scale-95 z-10 border border-white/5"
               >
                <Trash2 size={12} strokeWidth={2.5} />
              </button>
              <div 
                className="absolute bottom-1 left-1 w-6 h-6 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white/90 opacity-0 group-hover:opacity-100 transition-all pointer-events-none border border-white/5"
              >
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
            </div>
         ))}
         <button type="button" 
           onClick={() => fileInputRef.current?.click()}
           className="w-16 h-16 rounded-md border-2 border-dashed border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:border-white/50 transition-colors shrink-0"
         >
           <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
           </svg>
         </button>
      </div>
    </div>
  );
}
