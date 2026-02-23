import type { MutableRefObject, ChangeEvent } from 'react';
import type { CreateMode } from '../../hooks/useCreatePost';

interface UploadStepProps {
  fileInputRef: MutableRefObject<HTMLInputElement | null>;
  handleFileSelect: (e: ChangeEvent<HTMLInputElement>) => void;
  mode: CreateMode;
  setMode: (mode: CreateMode) => void;
  onTextStory?: () => void;
}

export default function UploadStep({ 
  fileInputRef, 
  handleFileSelect, 
  mode, 
  setMode,
  onTextStory
}: UploadStepProps) {
  
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-10 pb-32 text-center gap-4 relative w-full h-full">
      <div className="p-6 rounded-full bg-white/5 border-2 border-dashed border-white/20">
         <svg className="w-16 h-16 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
         </svg>
      </div>
      <h3 className="text-xl font-medium text-white">Drag photos and videos here</h3>
      <button type="button" 
          onClick={() => fileInputRef.current?.click()}
          className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors z-10"
        >
          Select from computer
        </button>

        {mode === 'STORY' && onTextStory && (
          <button type="button" 
            onClick={onTextStory}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium border border-white/10 transition-all flex items-center gap-2 group z-10"
          >
            <span className="text-lg">Aa</span>
            Create Text Story
          </button>
        )}
        <input 
          ref={fileInputRef}
          type="file" 
          multiple 
          accept="image/*,video/*" 
          className="hidden" 
          onChange={handleFileSelect}
        />

       {/* Mode Switcher */}
       <div className="p-4 bg-black border-t border-white/10 flex flex-col items-center gap-4 w-full absolute bottom-0">
          <div className="flex justify-center gap-8">
            {(['POST', 'STORY', 'FRAME'] as const).map((m) => (
                <button type="button"
                  key={m}
                  onClick={() => setMode(m)}
                  className={`text-sm font-bold tracking-wider transition-colors ${mode === m ? 'text-white underline underline-offset-8 decoration-2 decoration-brand-primary' : 'text-neutral-500 hover:text-neutral-300'}`}
                >
                    {m}
                </button>
            ))}
          </div>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
            Selected: <span className="text-white">{mode}</span>
          </p>
       </div>
    </div>
  );
}
