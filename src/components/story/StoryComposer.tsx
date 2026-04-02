import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, AnimatePresence } from 'framer-motion';
import { toBlob } from 'html-to-image';
import {
  X, Plus, Type, Smile, Image as ImageIcon, Send, Loader2,
  AlignLeft, AlignCenter, AlignRight, RotateCcw, Layers, Trash2,
  Move, ZoomIn, RotateCw, WrapText, ALargeSmall, LetterText
} from 'lucide-react';
import { logger } from '../../utils/logger';
import ColorPicker from './ColorPicker';

import type { StoryElement } from '../../types';

// ─── Font Library ───
const FONTS = [
  { name: 'Outfit', label: 'Outfit', style: 'sans-serif' },
  { name: 'Inter', label: 'Inter', style: 'sans-serif' },
  { name: 'Playfair Display', label: 'Playfair', style: 'serif' },
  { name: 'Space Grotesk', label: 'Space', style: 'sans-serif' },
  { name: 'DM Serif Display', label: 'DM Serif', style: 'serif' },
  { name: 'Bebas Neue', label: 'Bebas', style: 'sans-serif' },
  { name: 'Pacifico', label: 'Pacifico', style: 'cursive' },
  { name: 'Permanent Marker', label: 'Marker', style: 'cursive' },
  { name: 'Dancing Script', label: 'Dancing', style: 'cursive' },
  { name: 'Caveat', label: 'Caveat', style: 'cursive' },
] as const;

interface StoryComposerProps {
  initialMedia?: File;
  onClose: () => void;
  onPost: (blob: Blob) => Promise<void>;
  elements?: StoryElement[];
  bgStyle?: string;
  onElementsChange?: (elements: StoryElement[]) => void;
  onBgStyleChange?: (bg: string) => void;
}

// ─── Sticker Categories ───
const STICKER_CATEGORIES = [
  {
    label: 'Popular',
    items: ['🔥', '❤️', '😂', '😍', '🎉', '👍', '👏', '💯', '✨', '🙌', '💕', '😎', '🥳', '💪', '😊'],
  },
  {
    label: 'Faces',
    items: ['😀', '😃', '😄', '😁', '🤣', '😅', '😆', '🥹', '🤪', '😜', '🤩', '🥰', '😇', '🤗', '🤭'],
  },
  {
    label: 'Reactions',
    items: ['💀', '😭', '🫠', '🤯', '🫣', '🤔', '😤', '😈', '👀', '🫡', '👁️', '🫶', '🤌', '💅', '🙄'],
  },
  {
    label: 'Objects',
    items: ['🎯', '💎', '🏆', '🎨', '📸', '🎵', '🌟', '⚡', '🦋', '🌈', '🍕', '☕', '🎭', '🔮', '👑'],
  },
  {
    label: 'Nature',
    items: ['🌸', '🌺', '🌻', '🍀', '🌿', '☀️', '🌙', '⭐', '🌊', '🔥', '❄️', '🌴', '🌵', '🍁', '🌾'],
  },
];

// ─── Gradient & Color Backgrounds ───
const GRADIENTS = [
  // Premium gradients
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  // Bold
  'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)',
  'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
  'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)',
  'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
  // Dark moody
  'linear-gradient(135deg, #0c0c1d 0%, #1a1a3e 50%, #2d1b69 100%)',
  'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
  'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  'linear-gradient(135deg, #200122 0%, #6f0000 100%)',
  // Solid colors
  '#000000',
  '#1a1a1a',
  '#FFFFFF',
  '#4158D0',
  '#C850C0',
  '#0ea5e9',
  '#10b981',
  '#f43f5e',
];

// ─── Draggable Element Component ───
interface DraggableElementProps {
  el: StoryElement;
  containerRef: React.RefObject<HTMLDivElement | null>;
  isSelected: boolean;
  onUpdate: (id: string, updates: Partial<StoryElement>) => void;
  onSelect: (id: string) => void;
  setShowVGuide: (show: boolean) => void;
  setShowHGuide: (show: boolean) => void;
  setActiveTab: (tab: 'none' | 'text' | 'stickers' | 'background') => void;
  setTextInput: (text: string) => void;
  setTextColor: (color: string) => void;
  setTextStyle: (style: 'classic' | 'box' | 'neon') => void;
}

function DraggableStoryElement({
  el,
  containerRef,
  isSelected,
  onUpdate,
  onSelect,
  setShowVGuide,
  setShowHGuide,
  setActiveTab,
  setTextInput,
  setTextColor,
  setTextStyle,
}: DraggableElementProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(el.x);
  const y = useMotionValue(el.y);

  useEffect(() => {
    x.set(el.x);
    y.set(el.y);
  }, [el.x, el.y, x, y]);

  return (
    <motion.div
      ref={elementRef}
      drag
      dragMomentum={false}
      dragElastic={0}
      transformTemplate={({ x, y, scale, rotate }) =>
        `translate(${x}, ${y}) translate(-50%, -50%) scale(${scale}) rotate(${rotate})`
      }
      onDrag={() => {
        if (!containerRef.current || !elementRef.current) return;
        const container = containerRef.current.getBoundingClientRect();
        const element = elementRef.current.getBoundingClientRect();

        const containerCenterX = container.left + container.width / 2;
        const containerCenterY = container.top + container.height / 2;
        const elementCenterX = element.left + element.width / 2;
        const elementCenterY = element.top + element.height / 2;

        const threshold = 10;
        const nearV = Math.abs(elementCenterX - containerCenterX) < threshold;
        const nearH = Math.abs(elementCenterY - containerCenterY) < threshold;

        setShowVGuide(nearV);
        setShowHGuide(nearH);

        if (nearV) x.set(0);
        if (nearH) y.set(0);
      }}
      onDragStart={() => { onSelect(el.id); }}
      onDragEnd={() => {
        setShowVGuide(false);
        setShowHGuide(false);
        onUpdate(el.id, { x: x.get(), y: y.get() });
      }}
      initial={{ scale: 0 }}
      animate={{
        scale: el.scale,
        rotate: el.rotation,
        borderColor: isSelected ? 'rgba(255,255,255,0.5)' : 'transparent',
      }}
      style={{
        x, y,
        left: '50%',
        top: '50%',
        zIndex: isSelected ? 200 : 100,
        position: 'absolute',
      }}
      onPointerDown={(e) => { e.stopPropagation(); }}
      onTap={(event) => {
        if (event && 'stopPropagation' in event) {
          (event as MouseEvent | TouchEvent).stopPropagation();
        }
        onSelect(el.id);
        if (el.type === 'text') {
          setActiveTab('text');
          setTextInput(el.content);
          setTextColor(el.color || '#FFFFFF');
          setTextStyle(el.textStyle || 'box');
        }
      }}
      className={`absolute cursor-move touch-none border-2 rounded-2xl p-1 transition-colors ${
        isSelected ? 'border-white/50' : 'border-transparent'
      }`}
    >
      <div
        className={`
          relative px-4 py-2 rounded-xl flex items-center justify-center select-none
          ${el.type === 'sticker' ? 'text-6xl' : ''}
          ${el.textStyle === 'box' ? 'bg-black/60 backdrop-blur-md' : ''}
          ${el.textStyle === 'neon' ? 'font-bold' : ''}
        `}
        style={{
          color: el.color,
          textShadow:
            el.textStyle === 'neon'
              ? `0 0 10px ${el.color}, 0 0 20px ${el.color}`
              : '0 2px 4px rgba(0,0,0,0.5)',
          fontFamily: el.type === 'text' ? `"${el.fontFamily || 'Outfit'}", sans-serif` : 'inherit',
          fontSize: el.fontSize ? `${el.fontSize}px` : '24px',
          letterSpacing: el.letterSpacing ? `${el.letterSpacing}px` : 'normal',
          width: el.width ? `${el.width}px` : 'auto',
          textAlign: el.align || 'center',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          lineHeight: 1.3,
        }}
      >
        {el.content}
      </div>
    </motion.div>
  );
}

// ─── Main StoryComposer Component ───
export default function StoryComposer({
  initialMedia,
  onClose,
  onPost,
  elements: initialElements = [],
  bgStyle: initialBgStyle = GRADIENTS[0],
  onElementsChange,
  onBgStyleChange,
}: StoryComposerProps) {
  const [background, setBackground] = useState<File | null>(initialMedia || null);
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(
    initialMedia ? URL.createObjectURL(initialMedia) : null
  );
  const [bgStyle, setInternalBgStyle] = useState<string>(initialBgStyle);
  const [elements, setInternalElements] = useState<StoryElement[]>(initialElements);
  const [activeTab, setActiveTab] = useState<'none' | 'text' | 'stickers' | 'background'>('none');
  const [isExporting, setIsExporting] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [textStyle, setTextStyle] = useState<'classic' | 'box' | 'neon'>('box');
  const [textFont, setTextFont] = useState('Outfit');
  const [textFontSize, setTextFontSize] = useState(24);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [showVGuide, setShowVGuide] = useState(false);
  const [showHGuide, setShowHGuide] = useState(false);
  const [activeStickerCategory, setActiveStickerCategory] = useState(0);

  // Undo history
  const [history, setHistory] = useState<StoryElement[][]>([initialElements]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editAreaRef = useRef<HTMLTextAreaElement>(null);
  const addAreaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textareas
  useEffect(() => {
    const resize = (el: HTMLTextAreaElement | null) => {
      if (!el) return;
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    };
    if (selectedElementId) resize(editAreaRef.current);
    else resize(addAreaRef.current);
  }, [textInput, selectedElementId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setBackground(file);
      setBackgroundUrl(URL.createObjectURL(file));
      setBgStyle('');
    }
  };

  // Push to history
  const pushHistory = (newElements: StoryElement[]) => {
    const trimmed = history.slice(0, historyIndex + 1);
    setHistory([...trimmed, newElements]);
    setHistoryIndex(trimmed.length);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setInternalElements(history[newIndex]);
      onElementsChange?.(history[newIndex]);
    }
  };

  const addText = () => {
    if (!textInput.trim()) return;

    if (selectedElementId) {
      setSelectedElementId(null);
      setTextInput('');
      setActiveTab('none');
      return;
    }

    const newElement: StoryElement = {
      id: crypto.randomUUID(),
      type: 'text',
      content: textInput.trim(),
      x: 0,
      y: 0,
      scale: 1.0,
      rotation: 0,
      color: textColor,
      textStyle: textStyle,
      fontFamily: textFont,
      fontSize: textFontSize,
      letterSpacing: 0,
      width: 280,
      align: 'center',
    };

    const newElements = [...elements, newElement];
    setElements(newElements);
    pushHistory(newElements);
    setSelectedElementId(newElement.id);
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
      scale: 1.2,
      rotation: 0,
      align: 'center',
    };
    const newElements = [...elements, newElement];
    setElements(newElements);
    pushHistory(newElements);
    setSelectedElementId(newElement.id);
    setActiveTab('none');
  };

  const setBgStyle = (style: string) => {
    setInternalBgStyle(style);
    // Defer callback to avoid setState-during-render
    queueMicrotask(() => onBgStyleChange?.(style));
  };

  const setElements = (els: StoryElement[] | ((prev: StoryElement[]) => StoryElement[])) => {
    if (typeof els === 'function') {
      setInternalElements((prev) => {
        const next = els(prev);
        // Defer callback to avoid setState-during-render
        queueMicrotask(() => onElementsChange?.(next));
        return next;
      });
    } else {
      setInternalElements(els);
      queueMicrotask(() => onElementsChange?.(els));
    }
  };

  const updateElement = (id: string, updates: Partial<StoryElement>) => {
    setElements((prev) => prev.map((el) => (el.id === id ? { ...el, ...updates } : el)));
  };

  const removeElement = (id: string) => {
    const newElements = elements.filter((el) => el.id !== id);
    setElements(newElements);
    pushHistory(newElements);
    if (selectedElementId === id) setSelectedElementId(null);
  };

  const handlePost = async () => {
    if (!containerRef.current) return;
    setIsExporting(true);
    setSelectedElementId(null);

    logger.log('Starting story export...');
    try {
      const blob = await toBlob(containerRef.current, {
        quality: 1,
        backgroundColor:
          bgStyle.includes('gradient') || bgStyle.startsWith('#') ? undefined : '#000000',
        style: { borderRadius: '0' },
      });

      if (!blob) throw new Error('Failed to generate image');
      logger.log('Story export successful, blob size:', blob.size);

      await onPost(blob);
      onClose();
    } catch (err: unknown) {
      logger.error('Story export failed:', err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      alert(`Failed to create story image: ${errorMsg}`);
    } finally {
      setIsExporting(false);
    }
  };

  const selectedElement = elements.find((e) => e.id === selectedElementId);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col font-sans">
      {/* ─── Header ─── */}
      <div className="relative flex items-center justify-between px-4 py-3 z-30 bg-linear-to-b from-black/70 to-transparent">
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-xl text-white/70 hover:text-white transition-all"
        >
          <X size={22} />
        </button>

        {/* Tool Buttons */}
        <div className="flex gap-1.5">
          {/* Undo */}
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="p-2.5 rounded-xl transition-all disabled:opacity-20 bg-black/20 text-white/60 hover:bg-black/40 hover:text-white"
          >
            <RotateCcw size={18} />
          </button>

          <div className="w-px h-8 self-center bg-white/6" />

          {/* Background */}
          <button
            onClick={() => setActiveTab(activeTab === 'background' ? 'none' : 'background')}
            className={`p-2.5 rounded-xl transition-all ${
              activeTab === 'background'
                ? 'bg-white text-black scale-105 shadow-lg'
                : 'bg-black/20 text-white/60 hover:bg-black/40 hover:text-white'
            }`}
          >
            <ImageIcon size={18} />
          </button>
          {/* Text */}
          <button
            onClick={() => setActiveTab(activeTab === 'text' ? 'none' : 'text')}
            className={`p-2.5 rounded-xl transition-all ${
              activeTab === 'text'
                ? 'bg-white text-black scale-105 shadow-lg'
                : 'bg-black/20 text-white/60 hover:bg-black/40 hover:text-white'
            }`}
          >
            <Type size={18} />
          </button>
          {/* Stickers */}
          <button
            onClick={() => setActiveTab(activeTab === 'stickers' ? 'none' : 'stickers')}
            className={`p-2.5 rounded-xl transition-all ${
              activeTab === 'stickers'
                ? 'bg-white text-black scale-105 shadow-lg'
                : 'bg-black/20 text-white/60 hover:bg-black/40 hover:text-white'
            }`}
          >
            <Smile size={18} />
          </button>
        </div>

        {/* Post Button */}
        <motion.button
          onClick={handlePost}
          disabled={(!background && !bgStyle) || isExporting}
          className="bg-linear-to-r from-brand-primary to-brand-blue text-white px-5 py-2 rounded-xl font-bold text-sm
                     disabled:opacity-30 flex items-center gap-2 shadow-lg shadow-brand-primary/20
                     hover:shadow-brand-primary/30 transition-all"
          whileTap={{ scale: 0.95 }}
        >
          {isExporting ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <>
              Post <Send size={14} />
            </>
          )}
        </motion.button>
      </div>

      {/* ─── Main Canvas ─── */}
      <div
        className="flex-1 relative overflow-hidden bg-zinc-950 flex items-center justify-center p-3 md:p-8"
        onPointerDown={(e) => {
          if (e.target === e.currentTarget) setSelectedElementId(null);
        }}
      >
        <div
          ref={containerRef}
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) setSelectedElementId(null);
          }}
          className="relative aspect-9/16 h-full max-h-[85vh] bg-black overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.6)] rounded-[36px] border border-white/5"
          style={{
            ...(bgStyle?.startsWith('linear-gradient') || bgStyle?.startsWith('radial-gradient')
              ? { backgroundImage: bgStyle }
              : { backgroundColor: bgStyle || 'black' }),
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {backgroundUrl && (
            <img src={backgroundUrl} className="w-full h-full object-cover" alt="Background" />
          )}

          {/* Empty State */}
          {!backgroundUrl && !bgStyle && (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-4">
              <div className="w-20 h-20 rounded-3xl bg-white/4 flex items-center justify-center border border-white/6">
                <ImageIcon size={36} className="text-gray-600" />
              </div>
              <p className="text-sm font-medium text-white/20">Select a background to start</p>
            </div>
          )}

          {/* Render Elements */}
          {elements.map((el) => (
            <DraggableStoryElement
              key={el.id}
              el={el}
              containerRef={containerRef}
              isSelected={selectedElementId === el.id}
              onUpdate={updateElement}
              onSelect={setSelectedElementId}
              setShowVGuide={setShowVGuide}
              setShowHGuide={setShowHGuide}
              setActiveTab={setActiveTab}
              setTextInput={setTextInput}
              setTextColor={setTextColor}
              setTextStyle={setTextStyle}
            />
          ))}

          {/* Alignment Guides */}
          {showVGuide && (
            <div className="absolute inset-y-0 left-1/2 w-0.5 bg-[#ff00ea] z-100 pointer-events-none shadow-[0_0_15px_rgba(255,0,234,0.8)]" />
          )}
          {showHGuide && (
            <div className="absolute inset-x-0 top-1/2 h-0.5 bg-[#ff00ea] z-100 pointer-events-none shadow-[0_0_15px_rgba(255,0,234,0.8)]" />
          )}
        </div>
      </div>

      {/* ─── Bottom Panel ─── */}
      <div
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        className="bg-zinc-900/95 backdrop-blur-xl border-t border-white/4 z-40 safe-area-bottom max-h-[45vh] overflow-y-auto no-scrollbar"
      >
        <AnimatePresence mode="wait">
          {/* === ELEMENT EDIT MODE === */}
          {selectedElementId && selectedElement && (
            <motion.div
              key="element-editor"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.25 }}
              className="p-4 space-y-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-400">
                    {selectedElement.type === 'text' ? <Type size={14} /> : <Smile size={14} />}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/30">
                    Edit {selectedElement.type}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateElement(selectedElementId, { x: 0, y: 0 })}
                    className="text-[10px] bg-white/4 hover:bg-white/8 px-3 py-1.5 rounded-lg border border-white/6 transition-all font-bold text-white/50 hover:text-white/80 flex items-center gap-1"
                  >
                    <Move size={10} /> Center
                  </button>
                  <button
                    onClick={() => removeElement(selectedElementId)}
                    className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/15 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                  <button
                    onClick={() => setSelectedElementId(null)}
                    className="p-1.5 hover:bg-white/5 rounded-lg text-white/30 hover:text-white/60 transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Text Editing (Only for text) */}
              {selectedElement.type === 'text' && (
                <div className="space-y-3">
                  {/* Text Content Input */}
                  <textarea
                    ref={editAreaRef}
                    autoFocus
                    value={textInput}
                    rows={1}
                    onChange={(e) => {
                      setTextInput(e.target.value);
                      updateElement(selectedElementId, { content: e.target.value });
                    }}
                    className="w-full bg-white/5 text-white px-4 py-3 rounded-xl outline-none border border-white/10 focus:border-blue-500/50 transition-all font-medium text-base resize-none overflow-hidden"
                    placeholder="Type your text..."
                  />

                  {/* Font Selector — Horizontal Scroll */}
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                    {FONTS.map((font) => (
                      <button
                        key={font.name}
                        onClick={() => {
                          setTextFont(font.name);
                          updateElement(selectedElementId, { fontFamily: font.name });
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all shrink-0 border ${
                          (selectedElement.fontFamily || 'Outfit') === font.name
                            ? 'bg-white text-black border-white'
                            : 'text-white/40 hover:text-white/70 border-white/6 hover:border-white/15 bg-white/3'
                        }`}
                        style={{ fontFamily: `"${font.name}", ${font.style}` }}
                      >
                        {font.label}
                      </button>
                    ))}
                  </div>

                  {/* Style + Color + Alignment Row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Text Style Picker */}
                    <div className="flex bg-white/3 p-0.5 rounded-lg border border-white/5">
                      {(['classic', 'box', 'neon'] as const).map((style) => (
                        <button
                          key={style}
                          onClick={() => {
                            setTextStyle(style);
                            updateElement(selectedElementId, { textStyle: style });
                          }}
                          className={`px-3 py-1.5 rounded-md text-[10px] font-bold capitalize transition-all ${
                            textStyle === style
                              ? 'bg-white text-black'
                              : 'text-white/30 hover:text-white/60'
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>

                    <div className="w-px h-5 bg-white/6" />

                    {/* Alignment */}
                    <div className="flex bg-white/3 p-0.5 rounded-lg border border-white/5">
                      {(['left', 'center', 'right'] as const).map((align) => (
                        <button
                          key={align}
                          onClick={() => updateElement(selectedElementId, { align })}
                          className={`w-8 h-7 flex items-center justify-center rounded-md transition-all ${
                            (selectedElement.align || 'center') === align
                              ? 'bg-white text-black'
                              : 'text-white/30 hover:text-white/60'
                          }`}
                        >
                          {align === 'left' ? (
                            <AlignLeft size={13} />
                          ) : align === 'center' ? (
                            <AlignCenter size={13} />
                          ) : (
                            <AlignRight size={13} />
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="w-px h-5 bg-white/6" />

                    {/* Color Picker */}
                    <ColorPicker
                      selectedColor={textColor}
                      onColorSelect={(color) => {
                        setTextColor(color);
                        updateElement(selectedElementId, { color });
                      }}
                    />
                  </div>
                </div>
              )}

              {/* ── Sliders ── */}
              <div className="space-y-4 pb-4">
                {/* Font Size (text only) */}
                {selectedElement.type === 'text' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.12em] text-white/30">
                      <span className="flex items-center gap-1.5"><ALargeSmall size={11} className="text-blue-400" /> Font Size</span>
                      <span className="text-blue-400 font-mono">{selectedElement.fontSize || 24}px</span>
                    </div>
                    <input
                      type="range"
                      min="12"
                      max="120"
                      step="1"
                      value={selectedElement.fontSize || 24}
                      onChange={(e) => {
                        const size = parseInt(e.target.value);
                        setTextFontSize(size);
                        updateElement(selectedElementId, { fontSize: size });
                      }}
                      className="w-full"
                    />
                  </div>
                )}

                {/* Letter Spacing (text only) */}
                {selectedElement.type === 'text' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.12em] text-white/30">
                      <span className="flex items-center gap-1.5"><LetterText size={11} className="text-blue-400" /> Letter Spacing</span>
                      <span className="text-blue-400 font-mono">{selectedElement.letterSpacing || 0}px</span>
                    </div>
                    <input
                      type="range"
                      min="-4"
                      max="40"
                      step="0.5"
                      value={selectedElement.letterSpacing || 0}
                      onChange={(e) =>
                        updateElement(selectedElementId, { letterSpacing: parseFloat(e.target.value) })
                      }
                      className="w-full"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {/* Scale */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.12em] text-white/30">
                      <span className="flex items-center gap-1.5"><ZoomIn size={11} className="text-blue-400" /> Scale</span>
                      <span className="text-blue-400 font-mono">{selectedElement.scale.toFixed(2)}×</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="8.0"
                      step="0.01"
                      value={selectedElement.scale}
                      onChange={(e) =>
                        updateElement(selectedElementId, { scale: parseFloat(e.target.value) })
                      }
                      className="w-full"
                    />
                  </div>

                  {/* Rotation */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.12em] text-white/30">
                      <span className="flex items-center gap-1.5"><RotateCw size={11} className="text-blue-400" /> Rotation</span>
                      <span className="text-blue-400 font-mono">{selectedElement.rotation}°</span>
                    </div>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      step="1"
                      value={selectedElement.rotation}
                      onChange={(e) =>
                        updateElement(selectedElementId, { rotation: parseInt(e.target.value) })
                      }
                      className="w-full"
                    />
                  </div>

                  {/* Width (text only) */}
                  {selectedElement.type === 'text' && (
                    <div className="space-y-2 col-span-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.12em] text-white/30">
                        <span className="flex items-center gap-1.5"><WrapText size={11} className="text-blue-400" /> Text Width</span>
                        <span className="text-blue-400 font-mono">{selectedElement.width || 280}px</span>
                      </div>
                      <input
                        type="range"
                        min="40"
                        max="800"
                        step="5"
                        value={selectedElement.width || 280}
                        onChange={(e) =>
                          updateElement(selectedElementId, { width: parseInt(e.target.value) })
                        }
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* === BACKGROUND TAB === */}
          {!selectedElementId && activeTab === 'background' && (
            <motion.div
              key="background-tab"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.25 }}
              className="p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-white/25 uppercase tracking-[0.15em]">
                  Backgrounds
                </span>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[10px] bg-white/4 hover:bg-white/8 px-3 py-1.5 rounded-lg border border-white/6 flex items-center gap-1.5 transition-all font-bold text-white/50 hover:text-white/80"
                >
                  <ImageIcon size={12} /> Upload
                </button>
              </div>
              <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
                {GRADIENTS.map((grad, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setBgStyle(grad);
                      setBackground(null);
                      setBackgroundUrl(null);
                    }}
                    className={`w-12 h-[72px] rounded-xl shrink-0 border-2 transition-all duration-200 ${
                      bgStyle === grad
                        ? 'border-white scale-105 shadow-lg'
                        : 'border-transparent hover:border-white/20 opacity-80 hover:opacity-100'
                    }`}
                    style={
                      grad.startsWith('linear-gradient') || grad.startsWith('radial-gradient')
                        ? { backgroundImage: grad, backgroundSize: 'cover' }
                        : { backgroundColor: grad }
                    }
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* === TEXT TAB === */}
          {!selectedElementId && activeTab === 'text' && (
            <motion.div
              key="text-tab"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.25 }}
              className="p-4 space-y-3"
            >
              {/* Text Input + Add */}
              <div className="flex gap-2 items-start">
                <textarea
                  ref={addAreaRef}
                  autoFocus
                  value={textInput}
                  rows={1}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Capture some magic..."
                  className="flex-1 bg-white/5 text-white px-4 py-3 rounded-xl outline-none border border-white/10 focus:border-blue-500/50 transition-all font-medium resize-none overflow-hidden"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      addText();
                    }
                  }}
                />
                <motion.button
                  onClick={addText}
                  disabled={!textInput.trim()}
                  className="bg-white text-black h-12 w-12 rounded-xl flex items-center justify-center disabled:opacity-30 transition-all shrink-0"
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus size={20} />
                </motion.button>
              </div>

              {/* Font Selector */}
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                {FONTS.map((font) => (
                  <button
                    key={font.name}
                    onClick={() => setTextFont(font.name)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all shrink-0 border ${
                      textFont === font.name
                        ? 'bg-white text-black border-white'
                        : 'text-white/40 hover:text-white/70 border-white/6 hover:border-white/15 bg-white/3'
                    }`}
                    style={{ fontFamily: `"${font.name}", ${font.style}` }}
                  >
                    {font.label}
                  </button>
                ))}
              </div>

              {/* Style + Color Row */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex bg-white/3 p-0.5 rounded-lg border border-white/5">
                  {(['classic', 'box', 'neon'] as const).map((style) => (
                    <button
                      key={style}
                      onClick={() => setTextStyle(style)}
                      className={`px-3 py-1.5 rounded-md text-[10px] font-bold capitalize transition-all ${
                        textStyle === style
                          ? 'bg-white text-black'
                          : 'text-white/30 hover:text-white/60'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
                <div className="w-px h-5 bg-white/6" />
                <ColorPicker
                  selectedColor={textColor}
                  onColorSelect={(color) => setTextColor(color)}
                />
              </div>

              {/* Font Size Preview Slider */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.12em] text-white/30">
                  <span className="flex items-center gap-1.5"><ALargeSmall size={11} className="text-blue-400" /> Default Font Size</span>
                  <span className="text-blue-400 font-mono">{textFontSize}px</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="120"
                  step="1"
                  value={textFontSize}
                  onChange={(e) => setTextFontSize(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </motion.div>
          )}

          {/* === STICKERS TAB === */}
          {!selectedElementId && activeTab === 'stickers' && (
            <motion.div
              key="stickers-tab"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.25 }}
              className="p-4 space-y-3"
            >
              {/* Category Tabs */}
              <div className="flex gap-1 overflow-x-auto no-scrollbar">
                {STICKER_CATEGORIES.map((cat, idx) => (
                  <button
                    key={cat.label}
                    onClick={() => setActiveStickerCategory(idx)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${
                      activeStickerCategory === idx
                        ? 'bg-white/10 text-white border border-white/10'
                        : 'text-white/25 hover:text-white/50'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Sticker Grid */}
              <div className="grid grid-cols-8 gap-1">
                {STICKER_CATEGORIES[activeStickerCategory].items.map((s) => (
                  <motion.button
                    key={s}
                    onClick={() => addSticker(s)}
                    className="text-3xl p-2 rounded-xl hover:bg-white/5 transition-colors flex items-center justify-center"
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {s}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* === COLLAPSED STATE (no tab active, no selection) === */}
          {!selectedElementId && activeTab === 'none' && (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-4 flex justify-center"
            >
              <div className="flex items-center gap-2 text-[10px] text-white/15 font-medium">
                <Layers size={12} />
                <span>{elements.length} element{elements.length !== 1 ? 's' : ''}</span>
                {elements.length > 0 && (
                  <>
                    <span>·</span>
                    <span>Tap an element to edit</span>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
