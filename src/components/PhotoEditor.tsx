import { useState, useEffect, useMemo } from 'react';
import { Check, X } from 'lucide-react';

const FILTERS = [
  { name: 'Normal', class: '' },
  { name: 'Clarendon', class: 'brightness-110 contrast-125 saturate-125' },
  { name: 'Gingham', class: 'brightness-105 hue-rotate-350 contrast-90' },
  { name: 'Moon', class: 'grayscale brightness-110 contrast-110' },
  { name: 'Lark', class: 'brightness-105 contrast-90 saturate-125 sepia-[.15]' },
  { name: 'Reyes', class: 'sepia-[.20] brightness-110 contrast-85 saturate-75' },
  { name: 'Juno', class: 'contrast-115 brightness-115 saturate-140 sepia-[.15]' },
  { name: 'Slumber', class: 'brightness-105 saturate-65 sepia-[.20]' },
  { name: 'Crema', class: 'sepia-[.25] contrast-125 brightness-115' },
  { name: 'Ludwig', class: 'sepia-[.10] saturate-200 brightness-105' },
  { name: 'Aden', class: 'sepia-[.20] brightness-120 saturate-85 hue-rotate-340' },
  { name: 'Perpetua', class: 'contrast-110 brightness-125 saturate-110' },
];

interface Adjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  sepia: number;
  grayscale: number;
  hue: number;
  blur: number;
}

const DEFAULT_ADJUSTMENTS: Adjustments = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  sepia: 0,
  grayscale: 0,
  hue: 0,
  blur: 0,
};

interface PhotoEditorProps {
  image: File;
  onSave: (file: File, filter: string) => void;
  onCancel: () => void;
}

const AdjustmentSlider = ({ 
  label, 
  value, 
  min, 
  max, 
  onChange 
}: { 
  label: string, 
  value: number, 
  min: number, 
  max: number, 
  onChange: (val: number) => void 
}) => (
  <div className="space-y-3 px-4 py-2 animate-in fade-in slide-in-from-bottom-4">
    <div className="flex justify-between text-xs font-medium text-gray-400 uppercase tracking-wider">
      <span>{label}</span>
      <span>{value}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
    />
  </div>
);

export default function PhotoEditor({ image, onSave, onCancel }: PhotoEditorProps) {
  const [activeTab, setActiveTab] = useState<'FILTERS' | 'ADJUST'>('FILTERS');
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
  const [adjustments, setAdjustments] = useState<Adjustments>(DEFAULT_ADJUSTMENTS);
  const [activeAdjustment, setActiveAdjustment] = useState<keyof Adjustments>('brightness');
  
  const [previewUrl] = useState(URL.createObjectURL(image));
  const [thumbnailUrl, setThumbnailUrl] = useState<string>(previewUrl);
  const isVideo = image.type.startsWith('video');

  // Generate thumbnail for video files
  useEffect(() => {
    if (isVideo) {
      const video = document.createElement('video');
      video.src = previewUrl;
      video.muted = true;
      video.playsInline = true;
      video.currentTime = 0.1;
      
      const captureFrame = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, 320 / video.videoWidth); 
        canvas.width = video.videoWidth * scale;
        canvas.height = video.videoHeight * scale;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          setThumbnailUrl(canvas.toDataURL());
        }
      };

      video.onloadeddata = () => { video.currentTime = 0.1; };
      video.onseeked = () => { captureFrame(); };
    }
  }, [previewUrl, isVideo]);

  const computedStyle = useMemo(() => {
    // We combine the selected filter class (if any) with manual styles
    // Note: Tailwind classes on the image might conflict with inline styles if not careful.
    // Ideally, we replicate the filter class effects in manual adjustments or vice versa.
    // For now, we apply the filter class, and THEN the manual transform.
    // However, CSS filters stack.
    
    return {
      filter: `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%) sepia(${adjustments.sepia}%) grayscale(${adjustments.grayscale}%) hue-rotate(${adjustments.hue}deg) blur(${adjustments.blur}px)`
    };
  }, [adjustments]);

  const handleSave = () => {
    // Serialize both the filter class AND the manual adjustments.
    // Since our backend/DB likely expects a single string for "filter",
    // we can append the manual CSS to the class string if we treat it as a style string in the consumer,
    // OR we just assume the consumer will apply this as a style.
    
    // CURRENT ARCHITECTURE LIMITATION: The 'filter' prop in Media is likely just a string class.
    // We will pack the style string into it. The PostCard component needs to handle this.
    // If it's a tailwind class, it has no spaces/syntax like this.
    // Strategy: We will return valid CSS filter string. 
    // The consumer (CreatePostModal -> Upload) needs to know if it's a class or style.
    // To be safe and backward compatible, let's try to pass a mixed string and see if we can parse it later,
    // OR better: Return a string that includes the Tailwind class AND a marker for custom styles.
    
    // ACTUALLY: The easiest creating a robust app is to return a JSON string if possible, or just the CSS string.
    // But `filter` column might be used as `className`.
    // Let's assume we pass the CSS string directly.
    // But we also want the preset "Lark", "Moon" etc. 
    // Since those presets are just tailwind utility aliases, we can't easily "mix" them with inline styles 
    // comfortably without the receiving component knowing how to render them.
    
    // HYBRID APPROACH: 
    // We will construct a special string: "PRESET:Lark|BRIGHTNESS:110|CONTRAST:100..." 
    // No, that requires backend/frontend changes everywhere.
    
    // SIMPLER APPROACH:
    // We just return the inline style string. 
    // The preset filters are just shortcuts for these values anyway.
    // BUT the presets use complex combos that might be hard to replicate exactly with just these sliders (like specific contrast curves).
    // so we will keep the preset class, AND append a special separator, OR purely rely on the `style` attribute.
    
    // DECISION: We will return the `computedStyle.filter` string. 
    // If the user selected a preset, we should ideally extract its values as the base for the sliders.
    // But parsing Tailwind classes to values is hard.
    // So: Applying the filter class AND the inline style might duplicate effects (double brightness).
    
    // CHANGED PLAN for robustness:
    // When a filter is selected, we RESET the manual adjustments to neutral, 
    // but applying the filter *as the base*.
    // Since we can't easily "read" the filter class into values, we will accept that 
    // manual adjustments happen *on top* of the filter.
    
    const filterString = `filter-class:${selectedFilter.class}__style:${computedStyle.filter}`;
    onSave(image, filterString);
  };


  return (
    <div className="flex flex-col h-full bg-black text-white">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-white/10 bg-black z-10">
        <button type="button" onClick={onCancel} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
        </button>
        <div className="font-bold text-sm tracking-wide">Edit Photo</div>
        <button type="button" onClick={handleSave} className="p-2 text-blue-400 hover:text-blue-300 transition-colors">
            <Check size={20} />
        </button>
      </div>

      {/* Preview Area */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-neutral-900 checkerboard-pattern min-h-0">
        <div className="relative w-full h-full flex items-center justify-center p-4">
           {isVideo ? (
                <video
                  src={previewUrl}
                  className={`max-w-full max-h-full object-contain ${selectedFilter.class}`}
                  style={computedStyle}
                  controls={false}
                  playsInline
                  loop
                  autoPlay
                  muted
                />
            ) : (
                <img
                    src={previewUrl}
                    alt="Preview"
                    className={`max-w-full max-h-full object-contain ${selectedFilter.class}`}
                    style={computedStyle}
                />
            )}
        </div>
      </div>

      {/* Controls Area */}
      <div className="bg-neutral-900 border-t border-white/10 flex flex-col shrink-0 pb-safe">
        
        {/* Active Tool Control */}
        <div className="h-32 flex flex-col justify-center">
            {activeTab === 'FILTERS' ? (
                 <div className="flex overflow-x-auto items-center gap-4 px-4 no-scrollbar pb-2">
                    {FILTERS.map((filter) => (
                        <button type="button"
                        key={filter.name}
                        onClick={() => setSelectedFilter(filter)}
                        className="flex flex-col items-center gap-2 group min-w-[70px]"
                        >
                        <div className={`w-16 h-16 rounded-full overflow-hidden border-2 transition-all p-0.5 ${selectedFilter.name === filter.name ? 'border-blue-500 scale-105' : 'border-transparent opacity-70 group-hover:opacity-100'}`}>
                            <div className="w-full h-full rounded-full overflow-hidden">
                                <img
                                    src={thumbnailUrl} 
                                    alt={filter.name}
                                    className={`w-full h-full object-cover ${filter.class}`}
                                />
                            </div>
                        </div>
                        <span className={`text-[10px] uppercase font-bold tracking-wide ${selectedFilter.name === filter.name ? 'text-blue-400' : 'text-gray-500'}`}>
                            {filter.name}
                        </span>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="w-full max-w-sm mx-auto">
                    {activeAdjustment === 'brightness' && (
                        <AdjustmentSlider label="Brightness" value={adjustments.brightness} min={0} max={200} onChange={(v) => setAdjustments(p => ({...p, brightness: v}))} />
                    )}
                    {activeAdjustment === 'contrast' && (
                        <AdjustmentSlider label="Contrast" value={adjustments.contrast} min={0} max={200} onChange={(v) => setAdjustments(p => ({...p, contrast: v}))} />
                    )}
                    {activeAdjustment === 'saturation' && (
                        <AdjustmentSlider label="Saturation" value={adjustments.saturation} min={0} max={200} onChange={(v) => setAdjustments(p => ({...p, saturation: v}))} />
                    )}
                    {activeAdjustment === 'sepia' && (
                        <AdjustmentSlider label="Sepia" value={adjustments.sepia} min={0} max={100} onChange={(v) => setAdjustments(p => ({...p, sepia: v}))} />
                    )}
                     {activeAdjustment === 'grayscale' && (
                        <AdjustmentSlider label="Grayscale" value={adjustments.grayscale} min={0} max={100} onChange={(v) => setAdjustments(p => ({...p, grayscale: v}))} />
                    )}
                </div>
            )}
        </div>

        {/* Tab Switcher & Sub-menu */}
        <div className="flex flex-col border-t border-white/5">
            {/* Adjustment Selector (Only visible if Adjust tab active) */}
            {activeTab === 'ADJUST' && (
                <div className="flex overflow-x-auto py-2 border-b border-white/5 no-scrollbar">
                    {(['brightness', 'contrast', 'saturation', 'sepia', 'grayscale'] as const).map((adj) => (
                        <button type="button"
                            key={adj}
                            onClick={() => setActiveAdjustment(adj)}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${activeAdjustment === adj ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`}
                        >
                            {adj}
                        </button>
                    ))}
                     <button type="button"
                        onClick={() => setAdjustments(DEFAULT_ADJUSTMENTS)}
                        className="px-4 py-2 text-xs font-bold uppercase tracking-wider whitespace-nowrap text-red-400 hover:text-red-300 ml-auto"
                    >
                        Reset
                    </button>
                </div>
            )}

            {/* Main Tabs */}
            <div className="flex h-12">
                <button type="button" 
                    onClick={() => setActiveTab('FILTERS')}
                    className={`flex-1 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'FILTERS' ? 'text-white bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    Filters
                </button>
                <button type="button" 
                    onClick={() => setActiveTab('ADJUST')}
                    className={`flex-1 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'ADJUST' ? 'text-white bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    Adjust
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
