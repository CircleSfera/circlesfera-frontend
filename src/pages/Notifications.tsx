import { useQuery } from '@tanstack/react-query';
import { notificationsApi } from '../services';
import { Heart, MessageCircle, UserPlus, Star } from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingStates';
import { Link } from 'react-router-dom';
import type { Notification } from '../types';
import { useEffect } from 'react';
import { useNotificationsStore } from '../stores/notificationsStore';

// ... (imports)

export default function Notifications() {
  const { data: notifications, isLoading, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getAll()
  });

  const liveNotifications = useNotificationsStore((state) => state.liveNotifications);
  const clearUnread = useNotificationsStore((state) => state.clearUnread);

  // Mark all as read when opening the page
  useEffect(() => {
    notificationsApi.markAllAsRead();
    clearUnread();
    
    // Also refetch to ensure server state is fresh
    refetch();
  }, [clearUnread, refetch]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Merge API data and live notifications
  // We prefer live notifications at the top
  const apiNotifs: Notification[] = notifications?.data?.data || [];
  
  // Create a map to deduplicate by ID, preferring live (newer)
  const notifMap = new Map<string, Notification>();
  [...liveNotifications, ...apiNotifs].forEach(n => {
      if (!notifMap.has(n.id)) {
          notifMap.set(n.id, n);
      }
  });
  
  const notifs = Array.from(notifMap.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="min-h-screen pt-4 pb-20 px-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 px-2">Notifications</h1>
      
      <div className="space-y-2">
        {notifs.length === 0 ? (
            <div className="text-center py-20 opacity-50">
                <p>No notifications yet</p>
            </div>
        ) : (
            notifs.map((notif) => (
            <div 
                key={notif.id} 
                className={`glass-panel p-4 rounded-xl flex items-center gap-4 hover:bg-white/5 transition-colors ${!notif.read ? 'bg-white/5 border-l-4 border-l-brand-primary' : ''}`}
            >
                {/* Icon based on type */}
                <div className="shrink-0">
                    {notif.type === 'LIKE' && <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500"><Heart size={20} fill="currentColor" /></div>}
                    {notif.type === 'FOLLOW' && <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500"><UserPlus size={20} /></div>}
                    {notif.type === 'COMMENT' && <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500"><MessageCircle size={20} /></div>}
                    {notif.type === 'MENTION' && <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500"><span className="font-bold">@</span></div>}
                    {notif.type === 'FOLLOW_REQUEST' && <div className="w-10 h-10 rounded-full bg-gray-500/20 flex items-center justify-center text-gray-500"><UserPlus size={20} /></div>}
                    {notif.type === 'FOLLOW_ACCEPTED' && <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500"><UserPlus size={20} /></div>}
                </div>

                <div className="flex-1">
                    <p className="text-sm">
                        <Link to={`/${notif.sender?.profile.username}`} className="font-bold text-white hover:underline">
                            {notif.sender?.profile.username || 'Unknown'}
                        </Link>
                        <span className="text-gray-300 ml-1">
                            {notif.type === 'LIKE' && 'liked your post.'}
                            {notif.type === 'FOLLOW' && 'started following you.'}
                            {notif.type === 'COMMENT' && 'commented on your post.'}
                            {notif.type === 'MENTION' && 'mentioned you in a comment.'}
                            {notif.type === 'FOLLOW_REQUEST' && 'requested to follow you.'}
                            {notif.type === 'FOLLOW_ACCEPTED' && 'accepted your follow request.'}
                        </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(notif.createdAt).toLocaleDateString()}</p>
                </div>

                {notif.postId && (
                    <Link to={`/p/${notif.postId}`} className="shrink-0">
                        <div className="w-10 h-10 bg-white/10 rounded flex items-center justify-center overflow-hidden">
                           {/* We don't have post thumbnail in notification, so use generic or try fetching? 
                               For now generic icon is fine, or maybe the postId Link is enough */}
                            <Star size={16} />
                        </div>
                    </Link>
                )}
            </div>
            ))
        )}
      </div>
    </div>
  );
}
