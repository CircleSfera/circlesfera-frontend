import { motion } from 'framer-motion';
import { Reply, Smile, Trash2 } from 'lucide-react';
import UserAvatar from '../UserAvatar';
import AudioPlayer from './AudioPlayer';
import SharedPost from './SharedPost';
import type { Message } from '../../types';
import { useStoryStore } from '../../stores/storyStore';

interface MessageBubbleProps {
  msg: Message;
  isMe: boolean;
  isSeq: boolean;
  showAvatar: boolean;
  onReply: (msg: Message) => void;
  onReact: (messageId: string, emoji: string) => void;
  onDelete?: (messageId: string) => void;
  isRead?: boolean;
  currentUserId?: string;
}

const EMOJI_OPTIONS = ['❤️', '😂', '😮', '😢', '🔥', '👍'];

export default function MessageBubble({
  msg,
  isMe,
  isSeq,
  showAvatar,
  onReply,
  onReact,
  onDelete,
  isRead,
  currentUserId,
}: MessageBubbleProps) {
  const openStories = useStoryStore((state) => state.openStories);
  const timeString = msg.createdAt 
    ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <motion.div
      key={msg.id || msg.tempId}
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isMe ? 'justify-end' : 'justify-start'} group items-end mb-1 hover:z-50 ${!isSeq ? 'mt-6' : 'mt-1'}`}
    >
      {!isMe && (
        <div className="w-10 mr-2 shrink-0 flex justify-center">
          {showAvatar ? (
            <UserAvatar
              src={msg.sender?.profile.avatar || undefined}
              alt={msg.sender?.profile.username || 'User'}
              className="w-8 h-8 rounded-full shadow-sm"
            />
          ) : (
            <div className="w-8" />
          )}
        </div>
      )}

      <div className={`flex flex-col max-w-[75%] md:max-w-[65%] ${isMe ? 'items-end' : 'items-start'}`}>
        {/* Reply Context */}
        {msg.replyTo && (
          <div
            className={`mb-1 text-xs text-gray-300/80 bg-white/5 border-l-2 border-purple-500 pl-3 py-1.5 pr-2 rounded-r-lg cursor-pointer hover:bg-white/10 transition-colors truncate backdrop-blur-sm self-stretch max-w-xs`}
          >
            <div className="font-semibold text-purple-400 text-[10px] mb-0.5">
              Replying to {msg.replyTo?.sender?.profile?.username || 'user'}
            </div>
            <div className="truncate opacity-90 italic">
              {msg.replyTo?.content || (msg.replyTo?.mediaUrl ? 'Media Attachment' : 'Post')}
            </div>
          </div>
        )}

        <div className="relative group/msg">
          <div
            className={`px-4 py-2.5 text-[15px] leading-relaxed relative transition-all duration-300 ${
              isMe
                ? 'bg-linear-to-br from-blue-600 to-indigo-600 text-white rounded-[22px] rounded-tr-[4px] shadow-lg shadow-blue-500/20'
                : 'bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-[22px] rounded-tl-[4px]'
            } ${isSeq ? (isMe ? 'mt-1 rounded-tr-[22px]' : 'mt-1 rounded-tl-[22px]') : 'mt-2'}`}
          >
            {/* Story Reply Preview */}
            {msg.storyId && (
              <div 
                onClick={() => msg.story && openStories([msg.story], 0)}
                className={`mb-3 -mx-2 -mt-1 p-2 rounded-t-[18px] bg-black/20 backdrop-blur-md cursor-pointer group/story hover:bg-black/30 transition-all border-b border-white/5 flex gap-3 items-center`}
              >
                <div className="w-12 h-20 bg-zinc-800 rounded-lg overflow-hidden shrink-0 border border-white/10 group-hover/story:scale-105 transition-transform duration-300 relative shadow-2xl">
                   {msg.story?.mediaUrl ? (
                      msg.story.mediaType === 'video' ? (
                        <video src={msg.story.mediaUrl} className="w-full h-full object-cover" muted />
                      ) : (
                        <img src={msg.story.mediaUrl} alt="Story" className="w-full h-full object-cover" />
                      )
                   ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-40">
                         <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      </div>
                   )}
                   <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                </div>
                <div className="flex flex-col gap-1 py-1">
                  {!isMe && (
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-full w-fit">
                        Respondió a tu historia
                    </span>
                  )}
                  <p className="text-[11px] text-white/60 line-clamp-2 italic pr-4">
                    {msg.story?.mediaType === 'video' ? 'Mira el video de nuevo' : 'Ver historia original'}
                  </p>
                </div>
              </div>
            )}

            {/* Media Content */}
            {msg.mediaType === 'audio' && msg.mediaUrl ? (
              <AudioPlayer src={msg.mediaUrl} created={false} />
            ) : (
              msg.mediaUrl && (
                <div className="mb-2 -mx-2 -mt-2 overflow-hidden rounded-t-[18px]">
                  <img
                    src={msg.mediaUrl}
                    alt="Attachment"
                    className={`max-w-full object-cover transition-transform hover:scale-105 duration-300 ${
                      !msg.content ? 'rounded-b-[18px]' : ''
                    }`}
                  />
                </div>
              )
            )}

            {/* Shared Post Content */}
            {msg.post && (
              <div className="mb-2 -mx-1">
                <SharedPost post={msg.post} />
              </div>
            )}

            {/* Text Content */}
            {msg.content && (
              <div className="relative">
                <span className="break-all whitespace-pre-wrap">{msg.content}</span>
                <span className="inline-block w-14 h-3" /> {/* Spacer for absolute timestamp */}
              </div>
            )}
            
            {/* Timestamp & Read Ticks */}
            <div className={`absolute bottom-1 right-2.5 flex items-center gap-1 pl-2 text-[10px] ${isMe ? 'text-white/80' : 'text-gray-400'}`}>
                <span className="tabular-nums font-mono leading-none">{timeString}</span>
                {isMe && (
                    <div className="flex" title={isRead ? 'Read' : 'Delivered'}>
                        {isRead ? (
                            <svg viewBox="0 0 24 24" fill="none" className="w-[13px] h-[13px] text-blue-300">
                                <path d="M4 12L9 17L20 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M4 17L9 22L20 11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-60 -translate-x-1"/>
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24" fill="none" className="w-[13px] h-[13px]">
                                <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        )}
                    </div>
                )}
            </div>
          </div>

          {/* Hover Actions - Floating */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-0 group-hover/msg:opacity-100 transition-all duration-200 z-10 ${
              isMe ? '-left-32 flex-row-reverse' : '-right-28'
            }`}
          >
            <span className="text-[10px] text-gray-500 tabular-nums font-mono px-1">
              {timeString}
            </span>
            <div className={`flex bg-zinc-900/80 rounded-2xl p-1 shadow-2xl border border-white/10 backdrop-blur-xl ${isMe ? 'flex-row-reverse' : ''}`}>
              <button
                type="button"
                onClick={() => onReply(msg)}
                className="p-1.5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
                title="Reply"
              >
                <Reply size={14} />
              </button>
              <div className="relative group/emojis">
                <button
                  type="button"
                  className="p-1.5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
                  title="React"
                >
                  <Smile size={14} />
                </button>
                <div className={`absolute bottom-full mb-0 pb-3 ${isMe ? 'right-0' : 'left-0'} hidden group-hover/emojis:flex z-100 pointer-events-auto`}>
                  <div className="bg-zinc-900/95 backdrop-blur-2xl p-2 rounded-full flex gap-1 shadow-2xl border border-white/10 ring-1 ring-white/5">
                    {EMOJI_OPTIONS.map((emoji) => (
                      <motion.button
                        whileHover={{ scale: 1.3, y: -4 }}
                        whileTap={{ scale: 0.9 }}
                        key={emoji}
                        onClick={() => onReact(msg.id!, emoji)}
                        className="p-1.5 hover:bg-white/10 rounded-full transition-all text-xl leading-none"
                      >
                        {emoji}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              {isMe && onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(msg.id!)}
                  className="p-1.5 hover:bg-white/10 rounded-full text-gray-400 hover:text-red-400 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Reactions Display (Grouped by emoji) */}
          {msg.reactions && msg.reactions.length > 0 && (
            <div
              className={`absolute -bottom-3.5 ${
                isMe ? 'right-2' : 'left-2'
              } flex flex-wrap gap-1 z-50 pointer-events-auto p-0.5`}
              onClick={(e) => e.stopPropagation()} 
            >
              {[...new Set(msg.reactions.map(r => r.reaction))].map((emoji) => {
                const count = msg.reactions?.filter(r => r.reaction === emoji).length || 0;
                const hasReacted = msg.reactions?.some(r => r.reaction === emoji && r.userId === currentUserId);
                
                return (
                  <motion.button
                    key={emoji}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onReact(msg.id!, emoji)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold backdrop-blur-xl transition-all shadow-xl ${
                        hasReacted 
                        ? 'bg-blue-600/30 border-blue-500/40 text-blue-100 ring-1 ring-blue-500/21' 
                        : 'bg-zinc-900/90 border-white/10 text-zinc-300'
                    } border`}
                  >
                    <span>{emoji}</span>
                    {count > 1 && <span className="opacity-80">{count}</span>}
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
