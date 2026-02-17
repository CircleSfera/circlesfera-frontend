import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { SuggestedUser } from '../../types';
import { followsApi } from '../../services';
import { logger } from '../../utils/logger';

interface SuggestedUserCardProps {
  user: SuggestedUser;
  onFollow?: (userId: string) => void;
}

export const SuggestedUserCard: React.FC<SuggestedUserCardProps> = ({
  user,
  onFollow,
}) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFollow = async () => {
    setLoading(true);
    try {
      await followsApi.toggle(user.username);
      setIsFollowing(!isFollowing);
      if (onFollow) {
        onFollow(user.id);
      }
    } catch (error) {
      logger.error('Error following user:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isFollowing) return null; // Hide after following? or show "Following"

  return (
    <div className="flex flex-col items-center min-w-[140px] p-5 glass-panel rounded-2xl group/card hover:bg-white/5 transition-all duration-300">
      <Link to={`/${user.username}`} className="flex flex-col items-center">
        <div className="w-16 h-16 rounded-full p-0.5 bg-linear-to-tr from-brand-primary via-brand-secondary to-brand-accent mb-3 group-hover/card:shadow-[0_0_15px_rgba(131,58,180,0.3)] transition-all duration-300">
          <div className="w-full h-full rounded-full border-2 border-black overflow-hidden bg-zinc-900">
             {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.username}
                className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-8 h-8"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>
        <span className="font-bold text-sm truncate w-full text-center text-white tracking-tight">
          {user.username}
        </span>
        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider truncate w-full text-center mb-4">
          {user.fullName || 'Suggested'}
        </span>
      </Link>
      <button type="button"
        onClick={handleFollow}
        disabled={loading}
        className="w-full py-1.5 bg-brand-blue hover:bg-blue-600 text-white text-[10px] font-bold rounded-lg px-4 disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
      >
        {loading ? '...' : 'Follow'}
      </button>
    </div>
  );
};
