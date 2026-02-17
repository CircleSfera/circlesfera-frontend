import { Link } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';
import type { Post } from '../../types';

interface PostHeaderProps {
  post: Post;
  menuButtonRef: React.RefObject<HTMLButtonElement | null>;
  onMenuToggle: () => void;
}

export default function PostHeader({ post, menuButtonRef, onMenuToggle }: PostHeaderProps) {
  return (
    <div className="p-3 flex items-center gap-3 border-b border-white/5">
      <Link to={`/${post.user.profile.username}`} className="relative">
        <div className="absolute -inset-0.5 bg-linear-to-tr from-purple-500 to-blue-500 rounded-full opacity-70 blur-sm"></div>
        <img
          src={post.user.profile.avatar || 'https://via.placeholder.com/40'}
          alt={post.user.profile.username}
          className="relative w-8 h-8 rounded-full object-cover border border-white/20"
        />
      </Link>
      <Link to={`/${post.user.profile.username}`} className="flex-1 hover:opacity-80 transition-opacity">
        <div className="font-semibold text-sm text-white">
          {post.user.profile.fullName || post.user.profile.username}
        </div>
        <div className="text-xs text-gray-400">
          @{post.user.profile.username}
        </div>
      </Link>

      <button type="button"
        ref={menuButtonRef}
        onClick={onMenuToggle}
        className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
      >
        <MoreHorizontal size={20} className="text-gray-400" />
      </button>
    </div>
  );
}
