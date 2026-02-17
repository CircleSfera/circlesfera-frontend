import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { toBlob } from 'html-to-image';
import { X, Type, Smile, Image as ImageIcon, Send, Loader2 } from 'lucide-react';
import { logger } from '../../utils/logger';
import ColorPicker from './ColorPicker';

interface StoryElement {
  id: string;
  type: 'text' | 'sticker';
  content: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  color?: string;
  bg?: string;
  textStyle?: 'classic' | 'box' | 'neon';
}

interface StoryComposerProps {
  initialMedia?: File;
  onClose: () => void;
  onPost: (blob: Blob) => Promise<void>;
}

const STICKERS = ['🔥', '❤️', '😂', '😍', '🎉', '👍', '👎', '👀', '💯', '✨'];

const GRADIENTS = [
  'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)',
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)',
  'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
  '#000000',
  '#4158D0',
  '#C850C0',
  '#FFCC70',
];

export default function StoryComposer({ initialMedia, onClose, onPost }: StoryComposerProps) {
  const [background, setBackground] = useState<File | null>(initialMedia || null);
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(
    initialMedia ? URL.createObjectURL(initialMedia) : null
  );
  const [bgStyle, setBgStyle] = useState<string>(GRADIENTS[0]);
  const [elements, setElements] = useState<StoryElement[]>([]);
  const [activeTab, setActiveTab] = useState<'none' | 'text' | 'stickers' | 'background'>('none');
  const [isExporting, setIsExporting] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [textStyle, setTextStyle] = useState<'classic' | 'box' | 'neon'>('box');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setBackground(file);
      setBackgroundUrl(URL.createObjectURL(file));
      setBgStyle(''); // Clear gradient if image selected
    }
  };

  const addText = () => {
    if (!textInput.trim()) return;
    
    const newElement: StoryElement = {
      id: crypto.randomUUID(),
      type: 'text',
      content: textInput.trim(),
      x: 0, // motion treats these as relative to container if drag is used
      y: 0,
      scale: 1.0,
      rotation: 0,
      color: textColor,
      textStyle: textStyle,
    };
    
    setElements([...elements, newElement]);
    setTextInput('');
    setActiveTab('none');
  };

  const addSticker = (sticker: string) => {
    const newElement: StoryElement = {
      id: crypto.randomUUID(),
      type: 'sticker',
      content: sticker,
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
    };
    setElements([...elements, newElement]);
  };

  const updateElement = (id: string, updates: Partial<StoryElement>) => {
    setElements(elements.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  const removeElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    if (selectedElementId === id) setSelectedElementId(null);
  };

  const handlePost = async () => {
    if (!containerRef.current) return;
    setIsExporting(true);
    setSelectedElementId(null); // Unselect for clean export
    
    logger.log('Starting story export...');
    try {
      // 1. Capture the container as a blob (image)
      // Removing pixelRatio and cacheBust for better compatibility in dev
      const blob = await toBlob(containerRef.current, {
        quality: 0.95,
        skipFonts: true, // Often solves high-load/CORS issues with fonts during export
      });

      if (!blob) throw new Error('Failed to generate image');
      logger.log('Story export successful, blob size:', blob.size);

      // 2. Send to parent
      await onPost(blob);
      onClose();
    } catch (err: unknown) {
      logger.error('Story export failed:', err);
      // More descriptive error for debugging
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('EXPORT_ERROR_DETAILS:', {
          message: errorMsg,
          err: err,
          container: !!containerRef.current
      });
      alert(`Failed to create story image: ${errorMsg}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col font-sans">
      {/* Header */}
      <div className="relative flex items-center justify-between p-4 z-30 bg-linear-to-b from-black/60 to-transparent">
         <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
           <X size={24} />
         </button>
         
         <div className="flex gap-2">
             <button 
                onClick={() => setActiveTab(activeTab === 'background' ? 'none' : 'background')}
                className={`p-2.5 rounded-full transition-all ${activeTab === 'background' ? 'bg-white text-black scale-110 shadow-lg' : 'bg-black/30 text-white hover:bg-black/50'}`}
             >
                <ImageIcon size={20} />
             </button>
             <button 
                onClick={() => setActiveTab(activeTab === 'text' ? 'none' : 'text')}
                className={`p-2.5 rounded-full transition-all ${activeTab === 'text' ? 'bg-white text-black scale-110 shadow-lg' : 'bg-black/30 text-white hover:bg-black/50'}`}
             >
                <Type size={20} />
             </button>
             <button 
                onClick={() => setActiveTab(activeTab === 'stickers' ? 'none' : 'stickers')}
                className={`p-2.5 rounded-full transition-all ${activeTab === 'stickers' ? 'bg-white text-black scale-110 shadow-lg' : 'bg-black/30 text-white hover:bg-black/50'}`}
             >
                <Smile size={20} />
             </button>
         </div>

         <button 
           onClick={handlePost} 
           disabled={(!background && !bgStyle) || isExporting}
           className="bg-white text-black px-6 py-2 rounded-full font-black disabled:opacity-50 flex items-center gap-2 hover:bg-gray-200 transition-all shadow-xl active:scale-95"
         >
           {isExporting ? <Loader2 className="animate-spin" size={20} /> : <>Post <Send size={16} /></>}
         </button>
      </div>

      {/* Main Canvas / Preview */}
      <div 
        className="flex-1 relative overflow-hidden bg-zinc-950 flex items-center justify-center p-4 md:p-8"
        onClick={() => setSelectedElementId(null)}
      >
         <div 
           ref={containerRef}
           className="relative aspect-9/16 h-full max-h-[85vh] bg-black overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-[40px] border border-white/5"
           style={{ 
             background: bgStyle,
             backgroundSize: 'cover',
             backgroundPosition: 'center'
           }}
         >
            {backgroundUrl && (
                <img src={backgroundUrl} className="w-full h-full object-cover" alt="Background" />
            )}

            {/* Empty State / Hint */}
            {!backgroundUrl && !bgStyle && (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-4">
                    <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center border border-white/10">
                        <ImageIcon size={40} className="text-gray-600" />
                    </div>
                    <p className="text-sm font-medium">Select a background to start</p>
                </div>
            )}

            {/* Render Elements */}
            {elements.map(el => {
               const isSelected = selectedElementId === el.id;
               
               return (
                  <motion.div
                    key={el.id}
                    drag
                    dragMomentum={false}
                    initial={{ scale: 0 }}
                    animate={{ 
                      scale: el.scale,
                      rotate: el.rotation,
                      borderColor: isSelected ? 'rgba(255,255,255,0.5)' : 'transparent'
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        setSelectedElementId(el.id);
                        if (el.type === 'text') {
                            setActiveTab('text');
                            setTextInput(el.content);
                            setTextColor(el.color || '#FFFFFF');
                            setTextStyle(el.textStyle || 'box');
                        }
                    }}
                    className={`absolute cursor-move touch-none border-2 rounded-2xl p-1 transition-colors`}
                    style={{ left: '10%', top: '20%' }} // Initial pseudo-position
                  >
                      <div className={`
                        relative px-4 py-2 rounded-xl flex items-center justify-center select-none
                        ${el.type === 'sticker' ? 'text-6xl' : ''}
                        ${el.textStyle === 'box' ? 'bg-black/60 backdrop-blur-md' : ''}
                        ${el.textStyle === 'neon' ? 'font-bold' : ''}
                      `}
                      style={{ 
                          color: el.color,
                          textShadow: el.textStyle === 'neon' ? `0 0 10px ${el.color}, 0 0 20px ${el.color}` : '0 2px 4px rgba(0,0,0,0.5)',
                          fontFamily: el.type === 'text' ? 'Outfit, sans-serif' : 'inherit'
                      }}>
                         {el.content}
                         
                         {/* Controls (visible when selected) */}
                         {isSelected && (
                           <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex gap-2 bg-black/80 backdrop-blur-xl border border-white/10 p-1.5 rounded-full shadow-2xl z-50">
                              <button 
                                onClick={(e) => { e.stopPropagation(); updateElement(el.id, { scale: el.scale + 0.1 }); }}
                                className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full text-white"
                              >
                                +
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); updateElement(el.id, { scale: Math.max(0.2, el.scale - 0.1) }); }}
                                className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full text-white"
                              >
                                -
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); updateElement(el.id, { rotation: el.rotation + 15 }); }}
                                className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full text-white"
                              >
                                ⟳
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); removeElement(el.id); }}
                                className="w-8 h-8 flex items-center justify-center bg-red-500/80 hover:bg-red-500 rounded-full text-white"
                              >
                                <X size={14} />
                              </button>
                           </div>
                         )}
                      </div>
                  </motion.div>
               );
            })}
         </div>
      </div>

      {/* Tool Panels */}
      <div className="bg-zinc-900 border-t border-white/5 p-4 z-40 safe-area-bottom">
          {activeTab === 'background' && (
              <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
                  <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Backgrounds</span>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2 transition-all"
                      >
                         <ImageIcon size={14} /> Upload Image
                      </button>
                  </div>
                  <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                       {GRADIENTS.map((grad, i) => (
                           <button 
                              key={i}
                              onClick={() => { setBgStyle(grad); setBackground(null); setBackgroundUrl(null); }}
                              className={`w-14 h-20 rounded-xl shrink-0 border-2 transition-all ${bgStyle === grad ? 'border-white scale-105 shadow-lg' : 'border-transparent'}`}
                              style={{ background: grad, backgroundSize: 'cover' }}
                           />
                       ))}
                  </div>
              </div>
          )}

          {activeTab === 'text' && (
              <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
                  <div className="flex gap-2">
                      <input 
                        autoFocus
                        type="text" 
                        value={textInput}
                        onChange={(e) => {
                            setTextInput(e.target.value);
                            if (selectedElementId) updateElement(selectedElementId, { content: e.target.value });
                        }}
                        placeholder="Aa"
                        className="flex-1 bg-white/5 text-white px-5 py-3 rounded-2xl outline-none border border-white/10 focus:border-white/30 transition-all font-medium text-lg"
                        onKeyDown={(e) => e.key === 'Enter' && !selectedElementId && addText()}
                      />
                      {!selectedElementId && (
                        <button 
                            onClick={addText} 
                            disabled={!textInput.trim()}
                            className="bg-white text-black px-6 rounded-2xl font-bold disabled:opacity-50"
                        >
                            Add
                        </button>
                      )}
                  </div>

                  <div className="flex items-center gap-4">
                       <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                            {(['classic', 'box', 'neon'] as const).map(style => (
                                <button 
                                   key={style}
                                   onClick={() => {
                                       setTextStyle(style);
                                       if (selectedElementId) updateElement(selectedElementId, { textStyle: style });
                                   }}
                                   className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${textStyle === style ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                                >
                                   {style}
                                </button>
                            ))}
                       </div>
                       <div className="w-px h-6 bg-white/10" />
                       <ColorPicker 
                          selectedColor={textColor} 
                          onColorSelect={(color) => {
                              setTextColor(color);
                              if (selectedElementId) updateElement(selectedElementId, { color });
                          }} 
                       />
                  </div>
              </div>
          )}
          
          {activeTab === 'stickers' && (
              <div className="animate-in slide-in-from-bottom-4 duration-300">
                  <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Stickers</div>
                  <div className="flex gap-6 overflow-x-auto py-2 no-scrollbar px-2">
                      {STICKERS.map(s => (
                          <button 
                            key={s} 
                            onClick={() => addSticker(s)}
                            className="text-5xl hover:scale-125 hover:rotate-6 transition-all active:scale-95 shrink-0"
                          >
                            {s}
                          </button>
                      ))}
                  </div>
              </div>
          )}
      </div>
      
      <input 
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
