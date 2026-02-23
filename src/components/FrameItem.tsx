import { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Post } from '../types';
import { followsApi } from '../services';
import { useAuthStore } from '../stores/authStore';
import LikeButton from './LikeButton';
import RichText from './RichText';
import { logger } from '../utils/logger';

interface FrameItemProps {
  post: Post;
  isActive: boolean;
}

export default function FrameItem({ post, isActive }: FrameItemProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [likesCount, setLikesCount] = useState(post._count?.likes || 0);
  const { profile } = useAuthStore();
  const queryClient = useQueryClient();

  // Play/Pause based on active state
  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        logger.log('Autoplay blocked');
      });
    } else if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [isActive]);

  const followMutation = useMutation({
      mutationFn: () => followsApi.toggle(post.user.profile.username),
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['frames'] });
      }
  });

  const handleDoubleTap = () => {
    setShowHeartAnim(true);
    setTimeout(() => setShowHeartAnim(false), 1000);
    // If we want double tap to also trigger like, we could add it here
  };

  const isOwner = profile?.userId === post.userId;

  // Find video media
  const videoMedia = post.media?.find(m => m.type === 'video') || { url: '' };

  return (
    <div className="w-full h-full p-2 flex items-center justify-center">
      <div className="glass-panel-post w-full h-full rounded-2xl overflow-hidden flex flex-col relative">
        {/* Header - PostCard Style */}
        <div className="p-3 flex items-center gap-3 border-b border-white/5 bg-black/20 backdrop-blur-sm z-20">
          <Link to={`/${post.user.profile.username}`} className="relative">
            <div className="absolute -inset-0.5 bg-linear-to-tr from-brand-primary to-brand-blue rounded-full opacity-70 blur-sm"></div>
            <img
              src={post.user.profile.avatar || 'https://via.placeholder.com/40'}
              alt={post.user.profile.username}
              className="relative w-8 h-8 rounded-full object-cover border border-white/20"
            />
          </Link>
          <div className="flex-1 min-w-0">
             <Link to={`/${post.user.profile.username}`} className="hover:opacity-80 transition-opacity">
                <div className="font-semibold text-sm text-white truncate">
                  {post.user.profile.fullName || post.user.profile.username}
                </div>
                <div className="text-xs text-gray-400 truncate">
                  @{post.user.profile.username}
                </div>
              </Link>
          </div>
          
          {!isOwner && (
             <button type="button" 
                onClick={() => followMutation.mutate()}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-xs font-bold text-white transition-all transform active:scale-95"
             >
                Follow
             </button>
          )}

          <button type="button" className="p-1.5 rounded-full hover:bg-white/10 transition-colors">
            <MoreHorizontal size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Video Area */}
        <div className="flex-1 relative bg-black overflow-hidden flex items-center justify-center" onDoubleClick={handleDoubleTap}>
          <video
            ref={videoRef}
            src={videoMedia.url}
            className="w-full h-full object-cover"
            loop
            playsInline
            muted={false}
            onClick={(e) => {
                if (e.currentTarget.paused) e.currentTarget.play();
                else e.currentTarget.pause();
            }}
          />

          {/* Double Tap Heart Animation */}
          {showHeartAnim && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                  <Heart 
                      size={100} 
                      className={`fill-white text-white opacity-0 animate-heart-pop`} 
                  />
              </div>
          )}

          {/* Mute/Play Overlay Indicator (Optional) */}
        </div>

        {/* Footer - PostCard Style */}
        <div className="p-4 bg-black/40 backdrop-blur-md border-t border-white/5 z-20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-5">
              <LikeButton 
                postId={post.id} 
                onToggle={(newLiked) => {
                  setLikesCount(prev => newLiked ? prev + 1 : prev - 1);
                }}
              />
              <Link to={`/p/${post.id}`} className="hover:scale-110 transition-transform">
                <MessageCircle size={26} className="text-white/70 hover:text-white transition-colors" />
              </Link>
              <button type="button" className="hover:scale-110 transition-transform">
                <Share2 size={26} className="text-white/70 hover:text-white transition-colors" />
              </button>
            </div>
            <button type="button" className="hover:scale-110 transition-transform">
              <Bookmark size={26} className="text-white/70 hover:text-white transition-colors" />
            </button>
          </div>

          <div className="font-bold text-sm mb-2 text-white">
            {likesCount} likes
          </div>

          {post.caption && (
            <div className="text-sm text-gray-200 mb-2 line-clamp-3">
              <Link to={`/${post.user.profile.username}`} className="font-bold text-white mr-2 hover:underline">
                {post.user.profile.username}
              </Link>
              <RichText text={post.caption} />
            </div>
          )}

          <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
            {new Date(post.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}
