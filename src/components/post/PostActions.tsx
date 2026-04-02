import { Link } from 'react-router-dom';
import { Bookmark, Send } from 'lucide-react';
import LikeButton from '../LikeButton';
import type { Post } from '../../types';

interface PostActionsProps {
  post: Post;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  isBookmarkPending: boolean;
  onLikeToggle: (newLiked: boolean) => void;
  onShare: () => void;
}

export default function PostActions({
  post,
  isBookmarked,
  onToggleBookmark,
  isBookmarkPending,
  onLikeToggle,
  onShare,
}: PostActionsProps) {
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-4">
        <LikeButton 
          postId={post.id} 
          onToggle={onLikeToggle}
        />
        <Link to={`/p/${post.id}`} className="hover:scale-110 active:scale-95 transition-all text-white/60 hover:text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </Link>
        <button type="button" 
          onClick={onShare}
          className="hover:scale-110 active:scale-95 transition-all text-white/60 hover:text-white"
        >
          <Send className="w-6 h-6" />
        </button>
      </div>
      <button type="button"
        onClick={onToggleBookmark}
        className="hover:scale-110 active:scale-95 transition-all"
        disabled={isBookmarkPending}
      >
        <Bookmark
          size={24}
          className={`transition-all ${isBookmarked ? 'text-white fill-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : 'text-white/60 hover:text-white'}`}
        />
      </button>
    </div>
  );
}
