import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useSocketStore } from '../stores/socketStore';
import ConversationList from '../components/chat/ConversationList';

export default function ChatLayout() {
  const { connect, disconnect } = useSocketStore();

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return (
    <div className="h-[calc(100vh-80px)] pt-4 px-4 max-w-6xl mx-auto">
      <div className="flex h-full glass-panel rounded-3xl overflow-hidden border border-white/10">
        {/* Conversation List - Hidden on mobile if viewing chat */}
        <div className="w-full md:w-80 border-r border-white/10 hidden md:block">
           <ConversationList />
        </div>
        
        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-black/20">
           <Outlet />
        </div>
      </div>
    </div>
  );
}
