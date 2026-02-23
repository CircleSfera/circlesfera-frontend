import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { storiesApi } from '../services';
import type { Story } from '../types';
import UserAvatar from './UserAvatar';
import StoryViewer from './StoryViewer';
import { useAuthStore } from '../stores/authStore';

interface GroupedStories {
  user: Story['user'];
  stories: Story[];
}

export default function StoryList() {
  const { profile } = useAuthStore();
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedUserIndex, setSelectedUserIndex] = useState(0);

  const { data: storiesResponse } = useQuery({
    queryKey: ['stories'],
    queryFn: () => storiesApi.getAll(),
  });

  // Group stories by user
  const groupedStories = useMemo(() => {
    if (!storiesResponse?.data) return [];
    
    const groups: Map<string, GroupedStories> = new Map();
    
    (storiesResponse.data as Story[]).forEach((story: Story) => {
      const userId = story.user.id;
      if (groups.has(userId)) {
        groups.get(userId)!.stories.push(story);
      } else {
        groups.set(userId, { user: story.user, stories: [story] });
      }
    });
    
    return Array.from(groups.values());
  }, [storiesResponse]);

  // Flatten all stories for the viewer
  const allStories = useMemo(() => {
    return groupedStories.flatMap((group) => group.stories);
  }, [groupedStories]);

  const handleStoryClick = (userIndex: number) => {
    let storyIndex = 0;
    for (let i = 0; i < userIndex; i++) {
      storyIndex += groupedStories[i].stories.length;
    }
    setSelectedUserIndex(storyIndex);
    setViewerOpen(true);
  };

  return (
    <>
      <div className="glass-panel rounded-2xl p-4 mb-6 overflow-hidden">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide py-1">
          {/* Your Story / Add Story */}
          {(() => {
            const myStoriesIndex = groupedStories.findIndex(g => g.user.id === profile?.id);
            const hasStory = myStoriesIndex !== -1;

            if (hasStory) {
              return (
                <button type="button"
                  onClick={() => handleStoryClick(myStoriesIndex)}
                  className="flex flex-col items-center gap-2 shrink-0 group focus:outline-none"
                >
                  <div className="w-16 h-16 p-0.5 rounded-full bg-linear-to-tr from-yellow-400 via-pink-500 to-purple-500 flex items-center justify-center transform transition-transform duration-300 group-hover:scale-105">
                    <div className="w-full h-full bg-black rounded-full p-0.5 relative group-hover:opacity-90 transition-opacity flex items-center justify-center">
                      <UserAvatar
                        src={profile?.avatar}
                        alt="Your story"
                        size="lg"
                        hasStory={false}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 group-hover:text-white transition-colors">
                    Your story
                  </span>
                </button>
              );
            }

            return (
              <Link
                to="/create?mode=story"
                className="flex flex-col items-center gap-2 shrink-0 group"
              >
                <div className="relative transform transition-transform duration-300 group-hover:scale-105">
                  <div className="w-16 h-16 rounded-full p-0.5 bg-transparent flex items-center justify-center">
                    {profile?.avatar ? (
                      <div className="relative w-full h-full">
                        <img
                          src={profile.avatar}
                          alt="Your story"
                          className="w-full h-full rounded-full object-cover border border-white/10"
                        />
                        <div className="absolute bottom-0 right-0">
                          <div className="w-5 h-5 rounded-full bg-blue-500 border-[1.5px] border-black flex items-center justify-center">
                            <Plus size={12} className="text-white" strokeWidth={3} />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full rounded-full bg-zinc-800 border-[1.5px] border-dashed border-zinc-600 flex items-center justify-center group-hover:border-purple-500 transition-colors">
                        <Plus size={24} className="text-zinc-500 group-hover:text-purple-400 transition-colors" />
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-400 group-hover:text-purple-400 transition-colors">
                  Your story
                </span>
              </Link>
            );
          })()}

          {/* Other users' stories */}
          {groupedStories
            .map((group, index) => ({ ...group, originalIndex: index }))
            .filter(group => group.user.id !== profile?.id)
            .map((group) => {
              const hasCloseFriendStory = group.stories.some(s => s.isCloseFriendsOnly);
              const ringColorClass = hasCloseFriendStory 
                ? 'bg-green-500' 
                : 'bg-linear-to-tr from-yellow-400 via-pink-500 to-purple-500';

              return (
              <button type="button"
                key={group.user.id}
                onClick={() => handleStoryClick(group.originalIndex)}
                className="flex flex-col items-center gap-2 shrink-0 group focus:outline-none"
              >
                <div className={`w-16 h-16 p-0.5 rounded-full ${ringColorClass} flex items-center justify-center transform transition-transform duration-300 group-hover:scale-105`}>
                  <div className="w-full h-full bg-black rounded-full p-0.5 group-hover:opacity-90 transition-opacity flex items-center justify-center">
                    <UserAvatar
                      src={group.user.profile.avatar}
                      alt={group.user.profile.username}
                      size="lg"
                      hasStory={false}
                    />
                  </div>
                </div>
                <span className="text-xs text-gray-400 max-w-[64px] truncate group-hover:text-white transition-colors">
                  {group.user.profile.username}
                </span>
              </button>
            )})}

          {/* Empty state message if no stories */}
          {groupedStories.length === 0 && (
            <div className="flex items-center px-4">
              <span className="text-sm text-gray-500">No stories yet</span>
            </div>
          )}
        </div>
      </div>

      {viewerOpen && allStories.length > 0 && (
        <StoryViewer
          stories={allStories}
          initialIndex={selectedUserIndex}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </>
  );
}
