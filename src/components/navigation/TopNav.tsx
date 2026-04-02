import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useNotificationsStore } from '../../stores/notificationsStore';
import logoSrc from '../../assets/logo.png';
import { motion } from 'framer-motion';

export default function TopNav() {
  const unreadCount = useNotificationsStore((state) => state.unreadCount);

  return (
    <div className="flex md:hidden sticky top-0 left-0 right-0 h-16 border-b border-white/5 bg-black/60 backdrop-blur-2xl z-50 items-center justify-between px-4">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2">
        <img src={logoSrc} alt="CircleSfera" className="h-8 w-auto object-contain" />
        <span className="text-xl font-black tracking-tighter text-white">CircleSfera</span>
      </Link>

      {/* Direct Messages Icon */}
      <Link to="/direct/inbox" className="p-2 relative active:scale-90 transition-transform">
        <motion.div
           whileTap={{ scale: 0.9 }}
           className="text-gray-400 hover:text-white transition-colors"
        >
          <MessageCircle size={24} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-[16px] flex items-center justify-center text-[9px] font-bold text-white bg-red-500 rounded-full px-1 shadow-lg shadow-red-500/50">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </motion.div>
      </Link>
    </div>
  );
}
