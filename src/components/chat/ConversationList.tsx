import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiClient } from '../../services/api';
import { Edit, Search } from 'lucide-react';
import { useSocketStore } from '../../stores/socketStore';
import NewChatModal from './NewChatModal';
import UserAvatar from '../UserAvatar';
import { useAuthStore } from '../../stores/authStore';
import { motion, AnimatePresence } from 'framer-motion';

import type { Conversation, Message } from '../../types';
import { logger } from '../../utils/logger';

export default function ConversationList() {
  const { id: activeId } = useParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const { profile: me } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');

  const { socket, userStatuses } = useSocketStore();

  useEffect(() => {
    apiClient.get('/chat/conversations')
      .then((res) => setConversations(res.data))
      .catch((err) => logger.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg: Message) => { 
      setConversations((prev) => {
        const existingIdx = prev.findIndex(c => c.id === msg.conversationId);
        if (existingIdx !== -1) {
          // Move to top and update message
          const updated = [...prev];
          const [conv] = updated.splice(existingIdx, 1);
          
          // Check for duplication/tempId
          const processedMessages = (conv.messages as Message[]) || [];
           // If we have a temp message with this ID, replace it
          const tempIdx = processedMessages.findIndex(m => m.tempId === msg.tempId);
          if (tempIdx !== -1) {
               processedMessages[tempIdx] = msg;
          } else if (!processedMessages.some(m => m.id === msg.id)) {
               processedMessages.unshift(msg);
          }

          conv.messages = processedMessages;
          return [conv, ...updated];
        } else {
          // New conversation - fetch to get full details including participants
          apiClient.get('/chat/conversations').then(res => setConversations(res.data));
          return prev;
        }
      });
    };

    const handleConversationDeleted = ({ conversationId }: { conversationId: string }) => {
        setConversations((prev) => prev.filter(c => c.id !== conversationId));
    };

    socket.on('receiveMessage', handleNewMessage);
    socket.on('conversationDeleted', handleConversationDeleted);
    
    return () => {
      socket.off('receiveMessage', handleNewMessage);
      socket.off('conversationDeleted', handleConversationDeleted);
    };
  }, [socket]);

  const filteredConversations = conversations.filter(c => {
      if (!searchQuery) return true;
      const participants = c.participants || [];
      const other = participants.find(p => p.userId !== me?.userId)?.user;
      const name = c.name || other?.profile.fullName || other?.profile.username || '';
      return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
        <div className="flex flex-col h-full bg-black/95 border-r border-white/10 items-center justify-center space-y-4">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <p className="text-sm text-gray-500 font-medium">Loading chats...</p>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black border-r border-white/10">
      {/* Header Area */}
      <div className="p-5 flex flex-col gap-4 bg-black/80 backdrop-blur-xl sticky top-0 z-10 border-b border-white/5">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold tracking-tight text-white">Messages</h2>
            <motion.button 
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsNewChatOpen(true)}
                className="p-2 -mr-2 text-white/80 rounded-full transition-colors"
            >
                <Edit size={20} strokeWidth={2} />
            </motion.button>
        </div>
        
        {/* Search Bar */}
        <div className="relative group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search size={14} className="text-gray-500 group-focus-within:text-white transition-colors" />
            </div>
            <input 
                type="text" 
                placeholder="Search messages" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1c1c1c] text-sm text-white rounded-xl py-2 pl-9 pr-4 border-none focus:ring-1 focus:ring-white/20 placeholder-gray-600 transition-all"
            />
        </div>
      </div>
      
      {isNewChatOpen && <NewChatModal onClose={() => setIsNewChatOpen(false)} />}
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
        <AnimatePresence initial={false}>
        {conversations.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-64 text-center p-8 space-y-4"
          >
             <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center transform rotate-12 rings-1 ring-white/10">
                <Edit className="w-7 h-7 text-white/40" />
             </div>
             <div>
                <h3 className="text-base font-semibold text-white">No messages yet</h3>
                <p className="text-xs text-gray-500 max-w-[180px] mx-auto mt-1 leading-relaxed">Start connecting with your friends.</p>
             </div>
             <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsNewChatOpen(true)}
                className="px-5 py-2 bg-white text-black text-sm font-semibold rounded-full hover:bg-gray-100 transition-colors"
             >
                Send Message
             </motion.button>
          </motion.div>
        ) : (
          filteredConversations.map((conv) => {
            const participants = conv.participants || [];
            const otherParticipant = participants.find(p => p.userId !== me?.userId) || participants[0];
            const other = otherParticipant?.user;

            const lastMsg = conv.messages[0];
            const isActive = activeId === conv.id;
            const status = other ? userStatuses[other.id] : undefined;
            const isOnline = status ? status.isOnline : (other?.isOnline ?? false);
            
            // Check if last message is unread (simple check for now, ideally strictly check read receipts)
            const isUnread = lastMsg && lastMsg.senderId !== me?.userId; // simplified logic
            
            return (
              <Link to={`/direct/inbox/t/${conv.id}`} key={conv.id}>
                  <motion.div
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`group relative flex items-center p-3 rounded-xl transition-all duration-300 ${
                      isActive 
                        ? 'bg-white/10 shadow-lg' 
                        : 'hover:bg-white/5'
                    }`}
                  >
                    {/* Active Indicator Bar */}
                    {isActive && (
                        <motion.div 
                            layoutId="active-bar"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"
                        />
                    )}

                    <div className="relative shrink-0">
                        <UserAvatar 
                            src={other?.profile?.avatar || undefined} 
                            alt={other?.profile?.username} 
                            className={`w-12 h-12 transition-all hover:opacity-90`}
                            isOnline={isOnline}
                        />
                    </div>
                    
                    <div className="flex-1 min-w-0 ml-3.5">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className={`truncate text-[14px] ${isActive || isUnread ? 'font-semibold text-white' : 'font-medium text-white/90'}`}>
                            {conv.name || other?.profile?.fullName || other?.profile?.username}
                        </span>
                        {lastMsg && (
                            <span className={`text-[10px] font-medium ${isActive ? 'text-white/70' : 'text-gray-500'}`}>
                                {getTimeString(lastMsg.createdAt)}
                            </span>
                        )}
                      </div>
                      <div className="flex items-center text-xs">
                        <p className={`truncate max-w-[90%] ${isActive ? 'text-white/70' : (isUnread ? 'text-white font-medium' : 'text-gray-500')}`}>
                          {lastMsg ? (
                              <>
                                {lastMsg.senderId === me?.userId && <span className="mr-1">You:</span>}
                                {renderMessageContent(lastMsg)}
                              </>
                          ) : (
                              <span className="italic opacity-50">Draft</span>
                          )}
                        </p>
                        {isUnread && !isActive && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full ml-auto shrink-0" />
                        )}
                      </div>
                    </div>
                  </motion.div>
              </Link>
            );
          })
        )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function getTimeString(dateStr: string | Date) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 86400000 && now.getDate() === date.getDate()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (diff < 604800000) {
        return date.toLocaleDateString([], { weekday: 'short' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function renderMessageContent(msg: Message) {
    if (msg.mediaType === 'audio') return 'Sent a voice message';
    if (msg.mediaType === 'image') return 'Sent an image';
    if (msg.mediaUrl) return 'Sent an attachment';
    return msg.content;
}
