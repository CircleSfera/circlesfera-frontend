import React, { useEffect, useState } from 'react';
import type { SuggestedUser } from '../../types';
import { usersApi } from '../../services';
import { SuggestedUserCard } from './SuggestedUserCard';
import { logger } from '../../utils/logger';

export const SuggestionsList: React.FC = () => {
  const [users, setUsers] = useState<SuggestedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await usersApi.getSuggestions();
        setUsers(response.data);
      } catch (error) {
        logger.error('Error fetching suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  const handleFollow = () => {
    // Optionally remove user from list after follow
    // setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  if (!loading && users.length === 0) return null;

  return (
    <div className="py-6 my-2">
      <div className="flex justify-between items-center px-4 mb-4">
        <span className="font-black text-zinc-500 text-[10px] uppercase tracking-[0.2em]">
          Suggested for you
        </span>
        <button type="button" className="text-[10px] font-black uppercase tracking-wider text-brand-blue hover:text-blue-400 transition-colors">
          See All
        </button>
      </div>
      <div className="flex space-x-4 overflow-x-auto px-4 pb-4 no-scrollbar scroll-smooth">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="shrink-0 w-[140px] h-[200px] glass-panel rounded-2xl animate-pulse"
              />
            ))
          : users.map((user) => (
              <div key={user.id} className="shrink-0">
                <SuggestedUserCard user={user} onFollow={handleFollow} />
              </div>
            ))}
      </div>
    </div>
  );
};
