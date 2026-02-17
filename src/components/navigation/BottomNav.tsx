import { Home, Search, PlusSquare, Heart, User, Clapperboard } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/authStore';
import { notificationsApi } from '../../services';
import { motion } from 'framer-motion';

export default function BottomNav() {
  const location = useLocation();
  const path = location.pathname;
  const { profile, isAuthenticated } = useAuthStore();

  // Fetch unread notification count
  const { data: unreadData } = useQuery({
    queryKey: ['unreadNotifications'],
    queryFn: () => notificationsApi.getUnreadCount(),
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const unreadCount = unreadData?.data?.count || 0;

  const profileUrl = profile?.username ? `/${profile.username}` : '/';
  
  // Check if current path is the user's profile
  const isProfileActive = profile?.username && path === `/${profile.username}`;

  // Mobile nav with Heart for notifications instead of Messages
  const navItems = [
    { icon: Home, label: 'Home', to: '/', badge: 0 },
    { icon: Search, label: 'Search', to: '/explore', badge: 0 },
    { icon: Clapperboard, label: 'Frames', to: '/frames', badge: 0 },
    { icon: PlusSquare, label: 'Create', to: '/create', badge: 0 },
    { icon: Heart, label: 'Activity', to: '/activity', badge: unreadCount },
    { icon: User, label: 'Profile', to: profileUrl, badge: 0 },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-(--glass-border) bg-black/80 backdrop-blur-xl z-50">
      <div className="flex items-center justify-around px-2 py-4 pb-safe"> {/* pb-safe handles iPhone Home indicator if configured */}
        {navItems.map((item) => {
          const isActive = 
            item.label === 'Profile' 
              ? isProfileActive 
              : path === item.to || (item.to !== '/' && path.startsWith(item.to));
          
          return (
            <Link 
              key={item.label} 
              to={item.to} 
              className="p-2 relative"
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <motion.div
                className={`${
                    isActive ? 'text-brand-primary drop-shadow-[0_0_8px_rgba(131,58,180,0.5)]' : 'text-gray-500'
                }`}
                whileTap={{ scale: 0.9 }}
              >
                <item.icon size={28} strokeWidth={isActive ? 2.5 : 2} />
                
                {/* Notification Badge */}
                {item.badge > 0 && (
                  <span className="absolute top-0 right-0 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full px-1 shadow-lg shadow-red-500/50 animate-pulse">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
