import { X, Heart, Send, MoreHorizontal, Trash2, Eye, Music as MusicIcon, Smile, Volume2, VolumeX } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { storiesApi } from '../services';
import { useAuthStore } from '../stores/authStore';
import type { Story, UserWithProfile } from '../types';
import UserAvatar from './UserAvatar';
import { parseFilter } from '../utils/styleUtils';
import { logger } from '../utils/logger';

interface StoryViewerProps {
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
}

export default function StoryViewer({ stories, initialIndex, onClose }: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [viewers, setViewers] = useState<UserWithProfile[]>([]);
  const [showViewers, setShowViewers] = useState(false);
  const [isLoadingViewers, setIsLoadingViewers] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [reactions, setReactions] = useState<{ reaction: string; userId: string; user: UserWithProfile }[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressRef = useRef(false);
  const startX = useRef(0);

  
  const [bgAudio, setBgAudio] = useState<HTMLAudioElement | null>(null);
  
  const { profile } = useAuthStore();
  const queryClient = useQueryClient();

  const currentStory = stories[currentIndex];
  // Safeguard: if story doesn't exist (e.g. deleted), close
  useEffect(() => {
     if (!currentStory) onClose();
  }, [currentStory, onClose]);

  const isOwner = profile?.userId === currentStory?.userId;
  
  const STORY_DURATION = 5000; // 5 seconds per story
  const PROGRESS_INTERVAL = 50; // Update progress every 50ms

  // Mark as viewed
  useEffect(() => {
    let viewed = false;
    if (currentStory && !isOwner && !viewed) {
        storiesApi.markViewed(currentStory.id).catch(console.error);
        viewed = true;
    }
  }, [currentStory, isOwner]);

  // Audio Playback
  useEffect(() => {
    // Cleanup previous audio if any
    if (bgAudio) {
      bgAudio.pause();
      bgAudio.src = '';
      setBgAudio(null);
    }

    if (currentStory?.audio) {
      const audio = new window.Audio(currentStory.audio.url);
      audio.loop = true;
      if (!isPaused && !showViewers && !showDeleteConfirm) {
        audio.play().catch(e => logger.error("Story audio playback failed", e));
      }
      setBgAudio(audio);
    }

    return () => {
      if (bgAudio) {
        bgAudio.pause();
        bgAudio.src = '';
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]); // Only re-run when story changes

  useEffect(() => {
    if (bgAudio) {
      bgAudio.muted = isMuted;
      if (isPaused || showViewers || showDeleteConfirm) {
        bgAudio.pause();
      } else {
        bgAudio.play().catch(e => logger.error("Story audio playback failed", e));
      }
    }
  }, [isPaused, showViewers, showDeleteConfirm, bgAudio, isMuted]);

  const handleNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
      setShowViewers(false); // Close viewers if open when moving to next
      setShowDeleteConfirm(false);
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, onClose]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
      setShowViewers(false);
      setShowDeleteConfirm(false);
    }
  }, [currentIndex]);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPaused(true);
    setShowDeleteConfirm(true);
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(false);
    setIsPaused(false);
  };

  const confirmDelete = async (e: React.MouseEvent) => {
      e.stopPropagation();
      
      try {
          await storiesApi.delete(currentStory.id);
          queryClient.invalidateQueries({ queryKey: ['stories'] }); 
          onClose();
      } catch (error) {
          logger.error("Failed to delete story:", error);
          alert("Failed to delete story");
          setIsPaused(false);
      }
  };

  const handleShowViewers = async (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsPaused(true);
      setShowViewers(true);
      setIsLoadingViewers(true);
      try {
          const res = await storiesApi.getViews(currentStory.id);
          setViewers(res.data);
      } catch (error) {
          logger.error("Failed to load viewers", error);
      } finally {
          setIsLoadingViewers(false);
      }
  };

  const handleAddReaction = async (reaction: string) => {
      try {
          await storiesApi.addReaction(currentStory.id, reaction);
          // Refresh reactions
          const res = await storiesApi.getReactions(currentStory.id);
          setReactions(res.data);
          setShowReactions(false);
      } catch (error) {
          logger.error("Failed to add reaction", error);
      }
  };

  useEffect(() => {
      if (currentStory) {
          storiesApi.getReactions(currentStory.id).then(res => setReactions(res.data));
      }
  }, [currentStory]);

  const handleCloseViewers = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setShowViewers(false);
      setIsPaused(false);
  };

  // Auto-advance stories
  useEffect(() => {
    if (isPaused || showViewers || showDeleteConfirm) return;

    const progressIncrement = (PROGRESS_INTERVAL / STORY_DURATION) * 100;
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + progressIncrement;
      });
    }, PROGRESS_INTERVAL);

    return () => clearInterval(timer);
  }, [isPaused, showViewers, showDeleteConfirm, handleNext]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showDeleteConfirm) return; // Disable nav when modal open
      
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          handleNext();
          break;
        case 'ArrowLeft':
          handlePrev();
          break;
        case 'Escape':
          if (showViewers) handleCloseViewers();
          else if (showDeleteConfirm) setShowDeleteConfirm(false);
          else onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, onClose, showViewers, showDeleteConfirm]);

  if (!currentStory) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden">
      
      {/* Blurred Background Layer */}
      <div className="absolute inset-0 z-0">
          {(() => {
             const { className, style } = parseFilter(currentStory.filter);
             return currentStory.mediaType === 'video' ? (
                <video 
                   src={currentStory.mediaUrl} 
                   className={`w-full h-full object-cover blur-2xl opacity-50 scale-110 ${className}`} 
                   style={style}
                   muted 
                />
             ) : (
                <img 
                   src={currentStory.mediaUrl} 
                   alt="background" 
                   className={`w-full h-full object-cover blur-2xl opacity-50 scale-110 ${className}`} 
                   style={style}
                />
             );
          })()}
          <div className="absolute inset-0 bg-black/40" /> {/* Overlay for better text contrast */}
      </div>

      {/* progress bars */}
      <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2 pt-safe-top">
           {stories.map((story, idx) => (
             <div key={story.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-white transition-all duration-100 ease-linear shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                    style={{ 
                        width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%' 
                    }}
                />
             </div>
           ))}
      </div>

      {/* Header */}
      <div className="absolute top-4 left-0 right-0 z-20 px-4 pt-4 flex items-center justify-between pointer-events-none mt-safe-top">
          {/* Use pointer-events-auto for interactive children */}
          <div className="flex items-center gap-3 pointer-events-auto">
             <UserAvatar src={currentStory.user.profile?.avatar} alt={currentStory.user.profile?.username || 'User'} size="sm" />
             <div className="flex flex-col">
                 <span className="text-white font-semibold text-sm drop-shadow-md">{currentStory.user.profile?.username}</span>
                 <span className="text-white/80 text-xs drop-shadow-md">
                     {new Date(currentStory.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                 </span>
                 {currentStory.audio && (
                    <div className="flex items-center gap-1.5 mt-0.5 animate-in fade-in slide-in-from-left-2 duration-300">
                        <MusicIcon size={10} className="text-white/90 fill-white/20" />
                        <span className="text-white/90 text-xs font-medium truncate max-w-[120px] drop-shadow-md">
                            {currentStory.audio.title} • {currentStory.audio.artist}
                        </span>
                    </div>
                 )}
             </div>
          </div>
          <div className="flex items-center gap-4 pointer-events-auto">
                <button 
                    type="button" 
                    onClick={() => setIsMuted(!isMuted)} 
                    className="text-white/80 hover:text-white transition-colors bg-black/20 p-2 rounded-full backdrop-blur-sm"
                >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
               {isOwner && (
                   <button type="button" onClick={handleDeleteClick} className="text-white/80 hover:text-red-500 transition-colors bg-black/20 p-2 rounded-full backdrop-blur-sm">
                       <Trash2 size={20} />
                   </button>
               )}
               <button type="button" onClick={onClose} className="text-white bg-black/20 p-2 rounded-full hover:bg-white/20 backdrop-blur-sm">
                   <X size={24} />
               </button>
          </div>
      </div>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center z-0 p-4 sm:p-8">
         {(() => {
             const { className, style } = parseFilter(currentStory.filter);
             return currentStory.mediaType === 'video' ? (
                 <video 
                    src={currentStory.mediaUrl} 
                    className={`max-h-full max-w-full object-contain rounded-lg shadow-2xl ${className}`}
                    style={style}
                    autoPlay 
                    muted 
                    playsInline 
                 />
             ) : (
                 <img 
                    src={currentStory.mediaUrl} 
                    alt="Story" 
                    className={`max-h-full max-w-full object-contain rounded-lg shadow-2xl ${className}`}
                    style={style}
                 />
             );
          })()}
      </div>

       {/* Unified Gesture Handler Layer */}
       <div 
          className="absolute inset-0 z-10"
          onPointerDown={(e) => {
              // Store start X to detect swipes
              startX.current = e.clientX;
              
              // Start long press timer
              longPressTimer.current = setTimeout(() => {
                  setIsPaused(true);
                  longPressRef.current = true;
              }, 200);
          }}
          onPointerUp={(e) => {
              // Clear timer
              if (longPressTimer.current) {
                  clearTimeout(longPressTimer.current);
                  longPressTimer.current = null;
              }

              if (longPressRef.current) {
                  // Was a long press -> Resume
                  setIsPaused(false);
                  longPressRef.current = false;
              } else {
                  // Was a tap -> Navigate
                  // Check if it was a drag/swipe (> 10px diff)
                  if (Math.abs(e.clientX - startX.current) < 10) {
                      const width = window.innerWidth;
                      const x = e.clientX;
                      if (x < width * 0.3) {
                          handlePrev();
                      } else {
                          handleNext();
                      }
                  }
              }
          }}
          onPointerLeave={() => {
              if (longPressTimer.current) {
                  clearTimeout(longPressTimer.current);
              }
              setIsPaused(false);
              longPressRef.current = false;
          }}
       />

      {/* Footer / Controls */}
      <div className="absolute bottom-4 left-0 right-0 z-20 px-4 pb-4 pointer-events-none mb-safe-bottom">
           <div className="pointer-events-auto max-w-2xl mx-auto w-full">
               {!isOwner ? (
                    <div className="flex items-center gap-4">
                        <div className="flex-1 bg-black/20 backdrop-blur-md border border-white/20 rounded-full px-4 py-3 flex items-center shadow-lg">
                            <input 
                                type="text" 
                                placeholder="Send message..." 
                                className="bg-transparent text-white placeholder:text-white/70 flex-1 outline-none text-sm"
                                onFocus={() => setIsPaused(true)}
                                onBlur={() => setIsPaused(false)}
                            />
                        </div>
                        <button type="button" className="text-white hover:scale-110 transition drop-shadow-md">
                            <Heart size={28} />
                        </button>
                        <button type="button" className="text-white hover:scale-110 transition drop-shadow-md">
                             <Send size={24} />
                        </button>
                        <div className="relative">
                            <button type="button" 
                                onClick={(e: React.MouseEvent) => { e.stopPropagation(); setShowReactions(!showReactions); }}
                                className="text-white hover:scale-110 transition drop-shadow-md p-1"
                            >
                                <Smile size={28} />
                            </button>
                            <AnimatePresence>
                                {showReactions && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                        className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 p-2 rounded-full flex gap-2 shadow-2xl"
                                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                    >
                                        {['❤️', '🔥', '😂', '😮', '😢', '👍'].map(emoji => (
                                            <button type="button" 
                                                key={emoji}
                                                onClick={() => handleAddReaction(emoji)}
                                                className="text-2xl hover:scale-125 transition-transform p-1"
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
               ) : (
                   <div className="flex justify-between items-end">
                        <button type="button" 
                            onClick={handleShowViewers}
                            className="flex flex-col items-center gap-1 text-white hover:scale-105 transition group"
                        >
                             <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10 group-hover:bg-black/50 transition-colors">
                                 <Eye size={18} />
                                 <span className="font-semibold text-xs">{viewers.length} Views</span>
                             </div>
                        </button>
                        <button type="button" className="text-white bg-black/20 p-2 rounded-full hover:bg-white/20 backdrop-blur-md">
                            <MoreHorizontal size={24} />
                        </button>
                   </div>
               )}
           </div>
      </div>

      {/* Reactions Display (Owner View) */}
      {isOwner && reactions.length > 0 && (
          <div className="absolute bottom-20 left-4 z-20 flex flex-wrap gap-2 pointer-events-none">
              {reactions.slice(0, 5).map((r, i) => (
                  <div key={i} className="flex items-center gap-1 bg-black/40 backdrop-blur-md rounded-full px-2 py-1 border border-white/10 pointer-events-auto">
                      <span className="text-sm">{r.reaction}</span>
                      <span className="text-[10px] text-white/70">{r.user.profile.username}</span>
                  </div>
              ))}
          </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                className="bg-[#262626] rounded-xl p-6 w-[80%] max-w-xs shadow-2xl border border-white/10 transform scale-100 animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-1">
                        <Trash2 size={24} />
                    </div>
                    <h3 className="text-white font-bold text-lg">Delete Story?</h3>
                    <p className="text-white/60 text-sm mb-4">This action cannot be undone.</p>
                    
                    <div className="flex flex-col gap-2 w-full">
                        <button type="button" 
                            onClick={confirmDelete}
                            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                        >
                            Delete
                        </button>
                        <button type="button" 
                            onClick={cancelDelete}
                            className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Viewers Sheet */}
      {showViewers && (
          <>
            <div className="absolute inset-0 bg-black/50 z-40" onClick={handleCloseViewers} />
            <div 
                className="absolute inset-x-0 bottom-0 max-h-[70%] bg-[#1a1a1a]/95 backdrop-blur-xl rounded-t-3xl z-50 flex flex-col shadow-[0_-8px_30px_rgba(0,0,0,0.5)] border-t border-white/10 animate-in slide-in-from-bottom duration-300"
                onClick={(e) => e.stopPropagation()} 
            >
                {/* Drag Handle */}
                <div className="w-full flex justify-center pt-3 pb-1" onClick={handleCloseViewers}>
                    <div className="w-12 h-1.5 bg-white/20 rounded-full" />
                </div>

                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        Viewers <span className="bg-white/10 text-xs px-2 py-0.5 rounded-full text-white/80">{viewers.length}</span>
                    </h3>
                    <button type="button" onClick={handleCloseViewers} className="text-white/60 hover:text-white bg-white/5 p-1 rounded-full">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                    {isLoadingViewers ? (
                        <div className="flex justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-blue-500"></div>
                        </div>
                    ) : viewers.length > 0 ? (
                        <div className="space-y-1">
                            {viewers.map(viewer => (
                                <div key={viewer.id} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-colors cursor-pointer group">
                                    <UserAvatar src={viewer.profile?.avatar} alt={viewer.profile?.username || 'User'} size="md" />
                                    <div className="flex-1">
                                        <p className="text-white text-sm font-semibold group-hover:text-blue-400 transition-colors">{viewer.profile?.username}</p>
                                        <p className="text-white/50 text-xs">{viewer.profile?.fullName}</p>
                                    </div>
                                    <button type="button" className="text-white/40 hover:text-white p-2">
                                        <MoreHorizontal size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 opacity-40">
                             <Eye size={48} className="mb-3 text-white/50" />
                             <p className="text-white font-medium">No views yet</p>
                             <p className="text-white/50 text-sm">Viewer list will appear here</p>
                        </div>
                    )}
                </div>
            </div>
          </>
      )}
    </div>
  );

  return createPortal(modalContent, document.body);
}
