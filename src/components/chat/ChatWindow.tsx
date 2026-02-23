import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiClient, uploadApi, chatApi } from '../../services/index';
import { useSocketStore } from '../../stores/socketStore';
import UserAvatar from '../UserAvatar';
import { useAuthStore } from '../../stores/authStore';
import type { Message, Conversation, Participant } from '../../types';
import { Reply, X, Smile, Mic, Image as ImageIcon, Send, ArrowLeft, MoreVertical, Phone, Video, Trash2 } from 'lucide-react';
import AudioPlayer from './AudioPlayer';
import AudioRecorder from './AudioRecorder';
import SharedPost from './SharedPost';
import { motion, AnimatePresence } from 'framer-motion';
import { logger } from '../../utils/logger';

export default function ChatWindow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket, typingUsers, userStatuses, startTyping, stopTyping, markRead } = useSocketStore();
  const { profile } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAudioSend = async (audioBlob: Blob) => {
      setIsRecording(false);
      setIsUploading(true);
      try {
          const file = new File([audioBlob], "voice-message.webm", { type: "audio/webm" });
          const formData = new FormData();
          formData.append('file', file);
          const uploadRes = await uploadApi.upload(formData);
          
          await apiClient.post('/chat/messages', {
              conversationId: id,
              content: '🎤 Voice Message', // Placeholder content for validation
              mediaUrl: uploadRes.data.url,
              mediaType: 'audio'
          });
      } catch (err) {
          logger.error("Audio upload failed", err);
      } finally {
          setIsUploading(false);
      }
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers, id]);

  useEffect(() => {
    if (!id || !profile) return;
    
    // Fetch conversation details and messages
    apiClient.get<Message[]>(`/chat/conversations/${id}/messages`)
       .then(res => {
          setMessages(res.data);
       })
       .catch(err => logger.error('Failed to load messages', err));

    apiClient.get<Conversation[]>('/chat/conversations')
        .then(res => {
            const conv = res.data.find((c: Conversation) => c.id === id);
            if (conv) {
                setConversation(conv);
                markRead(id);
            }
        });
  }, [id, profile, markRead]);

  useEffect(() => {
    if (!socket || !id) return;

    const handleReceiveMessage = (msg: Message) => {
      if (msg.conversationId === id) { 
        setMessages((prev) => {
            // Check if we have a temp message with this ID
            const existingIdx = prev.findIndex(m => m.tempId === msg.tempId);
            if (existingIdx !== -1) {
                // Replace temp message with real one
                const newMessages = [...prev];
                newMessages[existingIdx] = msg;
                return newMessages;
            }
            // Check if message ID already exists (double safety)
            if (prev.some(m => m.id === msg.id)) return prev;
            
            return [...prev, msg];
        });
        markRead(id);
      }
    };

    const handleReaction = (data: { messageId: string, userId: string, reaction: string }) => {
        setMessages(prev => prev.map(msg => {
            if (msg.id === data.messageId) {
                const reactions = msg.reactions || [];
                // Check if user already reacted, if so update, else add (simplified)
                const existingReactionIdx = reactions.findIndex(r => r.userId === data.userId);
             const newReactions = [...reactions];
                if (existingReactionIdx !== -1) {
                    newReactions[existingReactionIdx] = { ...newReactions[existingReactionIdx], emoji: data.reaction };
                } else {
                    newReactions.push({ id: Date.now().toString(), emoji: data.reaction, userId: data.userId });
                }
                return { ...msg, reactions: newReactions };
            }
            return msg;
        }));
    };

    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('message_reaction', handleReaction);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('message_reaction', handleReaction);
    };
  }, [socket, id, markRead]);

  // Helper to get display name/avatar
  const getChatInfo = () => {
      if (!conversation || !profile) return { name: 'Chat', username: '', avatar: null, isGroup: false, userId: null };
      
      if (conversation.isGroup) {
          return {
              name: conversation.name || 'Group Chat',
              username: `${conversation.participants.length} members`,
              avatar: null, 
              isGroup: true,
              participants: conversation.participants,
              userId: null
          };
      }
      
      const myUsername = profile.username?.toLowerCase();
      const myId = profile.id;

      // Filter out me strictly by username (case-insensitive) AND ID
      // We want to find the participant that is NOT me.
      const others = conversation.participants.filter(p => {
          const pUsername = p.user.profile.username?.toLowerCase();
          const pId = p.userId;
          return pUsername !== myUsername && pId !== myId;
      });
      
      logger.log('Debug Chat Redirection:', { 
          myUsername,
          myId,
          allParticipants: conversation.participants.map(p => ({ u: p.user.profile.username, id: p.userId })),
          others: others.map(p => p.user.profile.username)
      });
      
      // If others exist, take the first one. 
      // If no others (e.g. self-chat), then target is me.
      const targetUser = others.length > 0 ? others[0].user : conversation.participants[0]?.user;

      return {
          name: targetUser?.profile.fullName || targetUser?.profile.username || 'User',
          username: targetUser?.profile.username || '',
          avatar: targetUser?.profile.avatar,
          isGroup: false,
          userId: targetUser?.id
      };
  };

  const chatInfo = getChatInfo();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);

    if (!socket || !id || !profile) return;

    // Only send typing indicators for 1-on-1 for now
    if (!chatInfo.isGroup && chatInfo.userId) {
         if (!isTyping) {
            setIsTyping(true);
            startTyping(id, chatInfo.userId);
        }

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            stopTyping(id, chatInfo.userId!); 
        }, 2000);
    }
  };

  const handleReply = (msg: Message) => {
    setReplyTo(msg);
    inputRef.current?.focus();
  };

  const cancelReply = () => {
    setReplyTo(null);
  };

  const sendReaction = (messageId: string, emoji: string) => {
      if (!socket || !chatInfo.userId) return; 
      socket.emit('send_reaction', { messageId, recipientId: chatInfo.userId, reaction: emoji });
      
      setMessages(prev => prev.map(msg => {
          if (msg.id === messageId) {
             const reactions = msg.reactions || [];
             const existingIdx = reactions.findIndex(r => r.userId === profile?.id);
             const newReactions = [...reactions];
             if (existingIdx !== -1) {
                 newReactions[existingIdx] = { ...newReactions[existingIdx], emoji };
             } else {
                 newReactions.push({ id: Date.now().toString(), emoji, userId: profile?.id ?? '' });
             }
             return { ...msg, reactions: newReactions };
          }
          return msg;
      }));
  };

  const confirmDelete = async () => {
    if (!id) return;
    try {
        await chatApi.deleteConversation(id);
        navigate('/direct/inbox');
    } catch (error) {
        logger.error("Failed to delete conversation", error);
        // Could show a toast here
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    setIsUploading(true);
    try {
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await uploadApi.upload(formData);
        
        await apiClient.post('/chat/messages', {
            conversationId: id,
            content: 'Sent an image',
            mediaUrl: uploadRes.data.url,
            mediaType: 'image'
        });
        
    } catch (err) {
        logger.error("Upload failed", err);
    } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socket || !id || !profile) return;

    const tempId = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    
    const tempMsg: Message = {
      id: tempId, 
      content: input,
      conversationId: id,
      senderId: profile.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sender: { id: profile.id, profile: profile },
      replyToId: replyTo?.id,
      replyTo: replyTo ? {
          ...replyTo,
          sender: replyTo.sender ? {
              id: replyTo.sender.id,
              profile: replyTo.sender.profile
          } : undefined
      } : undefined,
      tempId
    };
    setMessages(prev => [...prev, tempMsg]);

    apiClient.post('/chat/messages', {
        conversationId: id,
        content: input,
        replyToId: replyTo?.id,
        tempId
    }).catch(err => {
        logger.error("Failed to send", err);
    });
    
    setInput('');
    setReplyTo(null);
    setIsTyping(false);
    if (!chatInfo.isGroup && chatInfo.userId) {
        stopTyping(id, chatInfo.userId);
    }
  };

  const getTypingText = () => {
    if (!id || !conversation || !typingUsers[id]) return null;
    const typingIds = typingUsers[id].filter(uid => uid !== profile?.id);
    if (typingIds.length === 0) return null;
    
    if (chatInfo.isGroup) {
         if (typingIds.length === 1) {
             const user = conversation.participants.find(p => p.userId === typingIds[0]);
             return `${user?.user.profile.username} is typing...`;
         }
         return `${typingIds.length} people are typing...`;
    } else {
        return 'Typing...';
    }
  };

  const getStatusText = () => {
     const typing = getTypingText();
     if (typing) return <span className="text-purple-400 font-medium animate-pulse">{typing}</span>;
     
     if (chatInfo.isGroup) {
         return `${conversation?.participants.length || 0} members`;
     }
     
     if (chatInfo.userId) {
         const socketStatus = userStatuses[chatInfo.userId];
         if (socketStatus) {
             if (socketStatus.isOnline) return <span className="text-green-500">Active now</span>;
             if (socketStatus.lastSeenAt) {
                 const diff = Date.now() - new Date(socketStatus.lastSeenAt).getTime();
                 const mins = Math.floor(diff / 60000);
                 if (mins < 60) return `Active ${mins}m ago`;
                 const hours = Math.floor(mins / 60);
                 if (hours < 24) return `Active ${hours}h ago`;
                 return `Active recently`;
             }
         }
         // Fallback
         const participant = conversation?.participants.find(p => p.userId === chatInfo.userId);
         if (participant?.user?.isOnline) return <span className="text-green-500">Active now</span>;
     }
     return null;
  };

  return (
    <div className="flex flex-col h-full bg-black relative" onClick={() => setShowMenu(false)}>
       {/* Details Header */}
      <div className="px-6 py-3 flex items-center justify-between bg-black/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-20">
        <div className="flex items-center gap-4">
             <Link to="/direct/inbox" className="md:hidden text-white/70 hover:text-white transition-colors">
                <ArrowLeft size={24} />
             </Link>
                    {conversation ? (
                        <div 
                            className="flex items-center gap-4 cursor-pointer group"
                            onClick={() => !chatInfo.isGroup && chatInfo.username && navigate(`/${chatInfo.username}`)}
                        >
                            {chatInfo.isGroup ? (
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                                    <div className="grid grid-cols-2 gap-0.5 w-full h-full">
                                        {conversation.participants.slice(0, 4).map((p: Participant) => (
                                            <img key={p.id} src={p.user.profile.avatar || '/default-avatar.png'} className="w-full h-full object-cover" alt={p.user.profile.username} />
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="relative">
                                    <UserAvatar 
                                        className="w-10 h-10 transition-all hover:opacity-90" 
                                        src={chatInfo.avatar || undefined} 
                                        alt={chatInfo.name} 
                                        isOnline={chatInfo.userId ? userStatuses[chatInfo.userId]?.isOnline : false}
                                    />
                                </div>
                            )}
                            
                            <div className="flex flex-col justify-center">
                                <div className="font-bold text-white leading-none mb-1 text-[15px] group-hover:text-gray-200 transition-colors">
                                    {chatInfo.name}
                                </div>
                                <div className="text-xs font-medium text-gray-500">
                                     {!chatInfo.isGroup && chatInfo.username && (
                                        <span className="mr-2 text-white/60">@{chatInfo.username}</span>
                                     )}
                                     {getStatusText()}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4 animate-pulse">
                            <div className="w-10 h-10 rounded-full bg-white/10"></div>
                            <div className="space-y-2">
                                <div className="h-4 w-32 bg-white/10 rounded"></div>
                                <div className="h-3 w-16 bg-white/10 rounded"></div>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Header Actions */}
                <div className="flex items-center gap-4 text-white/70 relative">
                    <button type="button" className="hover:text-white transition-colors"><Phone size={20} /></button>
                    <button type="button" className="hover:text-white transition-colors"><Video size={24} /></button>
                    <div className="relative">
                        <button type="button" 
                            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }} 
                            className="hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                        >
                            <MoreVertical size={20} />
                        </button>
                        
                        <AnimatePresence>
                        {showMenu && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                className="absolute right-0 top-full mt-2 w-48 bg-[#262626] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 backdrop-blur-md"
                            >
                                <button type="button" 
                                    onClick={() => { setShowDeleteConfirm(true); setShowMenu(false); }}
                                    className="w-full flex items-center gap-2 px-4 py-3 text-red-500 hover:bg-white/5 transition-colors text-sm font-medium"
                                >
                                    <Trash2 size={16} />
                                    Delete Chat
                                </button>
                            </motion.div>
                        )}
                        </AnimatePresence>
                    </div>
                </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar relative z-0">
        {messages.length === 0 && !isUploading && (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-50">
                <p>No messages yet</p>
                <p className="text-xs">Say hello!</p>
            </div>
        )}
        
        <div className="flex flex-col justify-end min-h-full">
            <AnimatePresence initial={false}>
            {messages.map((msg, idx) => {
            const isMe = msg.senderId === profile?.id;
            const isSeq = idx > 0 && messages[idx - 1].senderId === msg.senderId;
            const showAvatar = !isMe && !isSeq;
            
            return (
                <motion.div 
                    key={msg.id || msg.tempId} 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'} group items-end mb-0.5 hover:z-10`}
                >
                {!isMe && (
                    <div className="w-10 mr-2 shrink-0 flex justify-center">
                            {showAvatar ? (
                            <UserAvatar 
                                src={msg.sender?.profile.avatar || undefined} 
                                alt={msg.sender?.profile.username || 'User'}
                                className="w-8 h-8 rounded-full shadow-sm" 
                            />
                            ) : <div className="w-8" />}
                    </div>
                )}
                
                <div className={`flex flex-col max-w-[75%] md:max-w-[65%] ${isMe ? 'items-end' : 'items-start'}`}>
                    {/* Reply Context */}
                    {msg.replyTo && (
                        <div className={`mb-1 text-xs text-gray-300/80 bg-white/5 border-l-2 border-purple-500 pl-3 py-1.5 pr-2 rounded-r-lg cursor-pointer hover:bg-white/10 transition-colors max-w-full truncate backdrop-blur-sm`}>
                            <div className="font-semibold text-purple-400 text-[10px] mb-0.5">Replying to {msg.replyTo?.sender?.profile.username}</div>
                            <div className="truncate opacity-90 italic">{msg.replyTo?.content || 'Attachment'}</div>
                        </div>
                    )}

                    <div className="relative group/msg">
                        <div
                                className={`px-4 py-2.5 text-[15px] leading-relaxed relative shadow-md backdrop-blur-sm transition-all ${
                                isMe 
                                    ? 'bg-linear-to-br from-[#6366f1] to-[#a855f7] text-white rounded-2xl rounded-tr-sm' 
                                    : 'bg-[#1c1c1c] border border-white/5 text-gray-100 rounded-2xl rounded-tl-sm'
                                } ${isSeq ? (isMe ? 'mt-0.5 rounded-tr-2xl' : 'mt-0.5 rounded-tl-2xl') : 'mt-1'}`}
                        >
                                {/* Media Content */}
                                {msg.mediaType === 'audio' && msg.mediaUrl ? (
                                    <AudioPlayer src={msg.mediaUrl} created={false} />
                                ) : msg.mediaUrl && (
                                    <div className="mb-2 -mx-2 -mt-2 overflow-hidden rounded-t-xl">
                                        <img 
                                            src={msg.mediaUrl} 
                                            alt="Attachment" 
                                            className={`max-w-full object-cover transition-transform hover:scale-105 duration-300 ${!msg.content ? 'rounded-b-xl' : ''}`} 
                                        />
                                    </div>
                                )}
                                
                                {msg.post && (
                                    <div className="mb-2 -mx-1">
                                        <SharedPost post={msg.post} />
                                    </div>
                                )}
                                
                                {msg.content && <span className="break-all whitespace-pre-wrap">{msg.content}</span>}
                            </div>

                            {/* Hover Actions - Floating */}
                            <div className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-0 group-hover/msg:opacity-100 transition-all duration-200 z-10 ${isMe ? '-left-24 px-2' : '-right-24 px-2'}`}>
                                <span className="text-[10px] text-gray-500 tabular-nums font-mono">
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <div className="flex bg-[#262626] rounded-full p-1 shadow-lg border border-white/5 backdrop-blur-md">
                                    <button type="button" onClick={() => handleReply(msg)} className="p-1.5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                                        <Reply size={14} />
                                    </button>
                                    <div className="relative group/emojis">
                                        <button type="button" className="p-1.5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                                            <Smile size={14} />
                                        </button>
                                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#2d2d2d] p-1.5 rounded-full hidden group-hover/emojis:flex gap-1 shadow-xl border border-white/10 z-50">
                                            {['❤️', '😂', '😮', '😢', '🔥', '👍'].map(emoji => (
                                                <motion.button 
                                                    whileHover={{ scale: 1.25 }}
                                                    key={emoji} 
                                                    onClick={() => sendReaction(msg.id, emoji)}
                                                    className="p-1 hover:bg-white/5 rounded-full transition-colors text-lg leading-none"
                                                >
                                                    {emoji}
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Reactions Display */}
                            {msg.reactions && msg.reactions.length > 0 && (
                                <motion.div 
                                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                                    className={`absolute -bottom-2.5 ${isMe ? 'right-0' : 'left-0'} flex -space-x-1`}
                                >
                                    {msg.reactions.map((r, i) => (
                                        <span key={`${r.id}-${i}`} className="bg-[#2d2d2d] border-2 border-black text-[10px] w-6 h-6 flex items-center justify-center rounded-full shadow-xs z-10">
                                            {r.emoji}
                                        </span>
                                    ))}
                                </motion.div>
                            )}
                    </div>
                </div>
                </motion.div>
            );
            })}
            </AnimatePresence>
            <div ref={messagesEndRef} />
        </div>
        
        {isUploading && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end p-2">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2 text-xs text-white/50 animate-pulse border border-white/5">
                    Uploading attachment...
                </div>
            </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-black border-t border-white/5 relative z-10">
        <AnimatePresence>
        {replyTo && (
            <motion.div 
                initial={{ opacity: 0, y: 10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: 10, height: 0 }}
                className="flex items-center justify-between bg-[#1c1c1c] p-3 rounded-t-2xl border-x border-t border-white/10 mb-[-12px] pb-6 pt-3 px-4 mx-2"
            >
               <div className="flex flex-col text-sm border-l-2 border-purple-500 pl-3">
                   <div className="flex items-center gap-2">
                        <span className="text-purple-400 font-semibold text-xs">Replying to {replyTo.sender?.profile.username}</span>
                   </div>
                   <span className="text-gray-400 line-clamp-1 text-xs mt-0.5">{replyTo.content || 'Attachment'}</span>
               </div>
               <button type="button" onClick={cancelReply} className="p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                   <X size={16} />
               </button>
            </motion.div>
        )}
        </AnimatePresence>
        
        <div className="relative">
            {isRecording ? (
                <AudioRecorder 
                    onSend={handleAudioSend} 
                    onCancel={() => setIsRecording(false)} 
                />
            ) : (
                <form onSubmit={sendMessage} className={`flex items-end gap-2 bg-[#1c1c1c] p-1.5 pr-2 rounded-[28px] border border-white/10 focus-within:border-white/20 focus-within:ring-1 focus-within:ring-white/10 transition-all ${replyTo ? 'rounded-t-lg border-t-0' : ''}`}>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                />
                
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                >
                    <ImageIcon size={22} strokeWidth={1.5} />
                </button>
                
                <input
                    ref={inputRef}
                    type="text"
                    className="flex-1 bg-transparent border-none py-3 px-1 text-white placeholder-gray-500 focus:ring-0 text-[15px] max-h-32 min-h-[44px]"
                    placeholder="Message..."
                    value={input}
                    onChange={handleInputChange}
                />
                
                {input.trim() || isUploading ? (
                    <motion.button 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        disabled={(!input.trim() && !isUploading)}
                        className="p-2.5 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-500 disabled:opacity-50 transition-colors shrink-0 shadow-lg shadow-blue-500/20"
                    >
                        <Send size={18} fill="currentColor" className="ml-0.5" />
                    </motion.button>
                ) : (
                    <div className="flex items-center gap-1">
                        <button 
                            type="button"
                            onClick={() => setIsRecording(true)}
                            className="p-2.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                        >
                            <Mic size={22} strokeWidth={1.5} />
                        </button>
                            <button 
                                type="button"
                                className="p-2.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                            >
                                <Smile size={22} strokeWidth={1.5} />
                            </button>
                    </div>
                )}

                <button type="submit" className="hidden" /> 
                </form>
            )}
        </div>
      </div>
    
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    onClick={() => setShowDeleteConfirm(false)}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="relative bg-[#262626] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl overflow-hidden"
                >
                    <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 text-red-500">
                            <Trash2 size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Delete Conversation?</h3>
                        <p className="text-white/60 text-sm mb-6">
                            Are you sure you want to delete this chat? This action cannot be undone and the conversation will be removed for everyone.
                        </p>
                        <div className="flex gap-3 w-full">
                            <button type="button" 
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button type="button" 
                                onClick={confirmDelete}
                                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-colors shadow-lg shadow-red-500/20"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
}
