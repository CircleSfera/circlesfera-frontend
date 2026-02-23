import { Home, Search, PlusSquare, MessageCircle, Heart, User, Settings, LogOut, Bookmark, Clapperboard } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/authStore';
import { notificationsApi } from '../../services';
import { motion } from 'framer-motion';

import { useEffect } from 'react';
import { useNotificationsStore } from '../../stores/notificationsStore';
import logoSrc from '../../assets/logo.png';

export default function Sidebar() {
  const location = useLocation();
  const path = location.pathname;
  const { profile, logout, isAuthenticated } = useAuthStore();
  const unreadCount = useNotificationsStore((state) => state.unreadCount);
  const setUnreadCount = useNotificationsStore((state) => state.setUnreadCount);

  // Fetch unread notification count
  const { data: unreadData } = useQuery({
    queryKey: ['unreadNotifications'],
    queryFn: () => notificationsApi.getUnreadCount(),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (unreadData?.data) {
        setUnreadCount(unreadData.data.count);
    }
  }, [unreadData, setUnreadCount]);

  const profileUrl = profile?.username ? `/${profile.username}` : '/';
  
  // Check if current path is the user's profile
  const isProfileActive = profile?.username && path === `/${profile.username}`;

  const navItems = [
    { icon: Home, label: 'Home', to: '/', badge: 0 },
    { icon: Search, label: 'Search', to: '/explore', badge: 0 },
    { icon: Clapperboard, label: 'Frames', to: '/frames', badge: 0 },
    { icon: PlusSquare, label: 'Create', to: '/create', badge: 0 },
    { icon: MessageCircle, label: 'Messages', to: '/direct/inbox', badge: 0 },
    { icon: Heart, label: 'Notifications', to: '/activity', badge: unreadCount },
    { icon: Bookmark, label: 'Saved', to: '/saved', badge: 0 },
    { icon: User, label: 'Profile', to: profileUrl, badge: 0 },
  ];

  return (
    <div className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-20 xl:w-64 border-r border-(--glass-border) bg-black/40 backdrop-blur-xl z-50 transition-all duration-300">
      {/* Logo Area */}
      <div className="p-6 mb-4 flex justify-center xl:justify-start">
        <Link to="/" className="block">
            {/* Desktop Logo */}
            <img 
              src={logoSrc} 
              alt="CircleSfera Logo" 
              className="hidden xl:block h-10 w-auto object-contain" 
            />
            {/* Tablet Logo (Icon) */}
            <img 
              src={logoSrc} 
              alt="CircleSfera Logo" 
              className="xl:hidden h-10 w-10 object-contain" 
            />
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 space-y-2">
        {navItems.map((item) => {
          const isActive = 
            item.label === 'Profile' 
              ? isProfileActive 
              : path === item.to || (item.to !== '/' && path.startsWith(item.to));
          
          return (
            <Link 
              key={item.label} 
              to={item.to}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-linear-to-r from-brand-primary/20 to-brand-blue/20 text-white font-semibold shadow-lg shadow-brand-primary/10 border border-brand-primary/20' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
               <motion.div
                 whileHover={{ scale: 1.1 }}
                 whileTap={{ scale: 0.95 }}
                 className="relative"
               >
                 <item.icon size={26} strokeWidth={isActive ? 2.8 : 2} />
                 
                 {/* Notification Badge */}
                 {item.badge > 0 && (
                   <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full px-1 shadow-lg shadow-red-500/50 animate-pulse">
                     {item.badge > 99 ? '99+' : item.badge}
                   </span>
                 )}
               </motion.div>
               <span className="hidden xl:block text-md">{item.label}</span>
               
               {/* Badge for desktop expanded view */}
               {item.badge > 0 && (
                 <span className="hidden xl:flex ml-auto min-w-[22px] h-[22px] items-center justify-center text-xs font-bold text-white bg-red-500 rounded-full px-1.5">
                   {item.badge > 99 ? '99+' : item.badge}
                 </span>
               )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Area (More/Settings) */}
      <div className="p-3 mt-auto mb-4 space-y-2">
        <Link 
            to="/accounts/edit"
            aria-label="Settings"
            className="flex items-center gap-4 p-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all duration-200"
        >
             <Settings size={26} />
             <span className="hidden xl:block text-md">Settings</span>
        </Link>
        
        {/* Logout Button */}
         <button type="button" 
            onClick={logout}
            aria-label="Log out"
            className="w-full flex items-center gap-4 p-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
        >
             <LogOut size={26} />
             <span className="hidden xl:block text-md">Log out</span>
        </button>
      </div>
    </div>
  );
}
