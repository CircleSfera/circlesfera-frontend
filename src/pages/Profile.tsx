import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { profileApi, postsApi, followsApi, highlightsApi } from '../services';
import type { Post, Collection, ProfileWithUser, Profile, UserWithProfile } from '../types';
import CreateHighlightModal from '../components/modals/CreateHighlightModal';
import ReportModal from '../components/modals/ReportModal';
import BlockModal from '../components/modals/BlockModal';
import { Bookmark, Clapperboard, Plus, UserSquare2, Heart, MessageCircle, Grid, Link as LinkIcon, MapPin, ExternalLink, Settings, MoreHorizontal, Flag, Ban } from 'lucide-react';
import { Skeleton, ProfileSkeleton } from '../components/LoadingStates';
import { useState } from 'react';
import CollectionCard from '../components/collections/CollectionCard';
import CreateCollectionModal from '../components/collections/CreateCollectionModal';
import FollowButton from '../components/FollowButton';
import HighlightBubble from '../components/HighlightBubble';
import FollowersModal from '../components/FollowersModal';

type TabType = 'posts' | 'frames' | 'saved' | 'tagged';

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [showFollowsModal, setShowFollowsModal] = useState<'followers' | 'following' | null>(null);
  const [isHighlightModalOpen, setIsHighlightModalOpen] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false); // For future block confirmation if needed


  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => profileApi.getProfile(username!) as Promise<{ data: ProfileWithUser }>,
    enabled: !!username,
  });

  const { data: myProfile } = useQuery({
      queryKey: ['myProfile'],
      queryFn: () => profileApi.getMyProfile() as Promise<{ data: ProfileWithUser }>,
      retry: false
  });
  const isMe = myProfile?.data.username === username;

  const { data: followStatus } = useQuery({
      queryKey: ['follow', username],
      queryFn: () => followsApi.check(username!),
      enabled: !!username && !isMe,
  });

  const isFollowing = followStatus?.data.following;
  const status = followStatus?.data.status as string | undefined;
  const isBlocked = status === 'BLOCKED';

  // Only fetch posts/followers if allowed
  // We can't use 'profile' in the condition if it's not loaded yet, 
  // but we can check if username exists. 
  // Better: use 'enabled' flag in queries to handle dependencies.
  const canView = isMe || (profile?.data && !profile.data.isPrivate) || isFollowing;

  const { data: posts } = useQuery({
    queryKey: ['userPosts', username],
    queryFn: () => postsApi.getByUser(username!, 1, 10, 'POST'),
    enabled: !!username && !!canView && !isBlocked && activeTab === 'posts',
  });

  const { data: frames } = useQuery({
    queryKey: ['userFrames', username],
    queryFn: () => postsApi.getByUser(username!, 1, 10, 'FRAME'),
    enabled: !!username && !!canView && !isBlocked && activeTab === 'frames',
  });

  const { data: highlights } = useQuery({
    queryKey: ['userHighlights', profile?.data.id],
    queryFn: () => highlightsApi.getUserHighlights(profile!.data.userId),
    enabled: !!profile?.data,
  });

  const { data: followList } = useQuery({
    queryKey: ['follows', username, showFollowsModal],
    queryFn: () => showFollowsModal === 'followers' 
      ? followsApi.getFollowers(username!) 
      : followsApi.getFollowing(username!),
    enabled: !!showFollowsModal && !!username,
  });

  const { data: taggedPosts } = useQuery({
    queryKey: ['userTagged', username],
    queryFn: () => postsApi.getTagged(username!),
    enabled: !!username && !!canView && !isBlocked && activeTab === 'tagged',
  });

  /* Collections Logic & Query - moved to top level to avoid redeclaration and scope issues */
  const [savedTab, setSavedTab] = useState<'all' | 'collections'>('collections');
  const [selectedCollection, setSelectedCollection] = useState<{ id: string; name: string } | null>(null);
  const [isCreateCollectionModalOpen, setIsCreateCollectionModalOpen] = useState(false);

  // Collections Query
  const { data: collections } = useQuery({
    queryKey: ['collections'],
    queryFn: () => import('../services').then(m => m.collectionsApi.getAll()),
    enabled: !!isMe && activeTab === 'saved',
  });

  // Saved Posts Query (All or Collection)
  const { data: savedPosts } = useQuery({
    queryKey: ['savedPosts', selectedCollection?.id],
    queryFn: () => import('../services').then(m => m.bookmarksApi.getAll(1, 10, selectedCollection?.id)),
    enabled: !!isMe && activeTab === 'saved',
  });

  /* Highlights - Unused for now as UI is missing, but keeping query if needed later or commenting out to fix build */
  // const { data: highlights } = useQuery({
  //     queryKey: ['userHighlights', username],
  //     queryFn: () => highlightsApi.getUserHighlights(profile?.data.id ?? ''),
  //     enabled: !!username && !!profile?.data?.id && !!canView && !isBlocked,
  // });

  /* Unused queries/mutations due to missing Profile Header UI */
  // const { data: followers } = useQuery({ ... });
  // const { data: following } = useQuery({ ... });
  // const blockMutation = useMutation({ ... });

  if (isLoadingProfile || !profile) {
    return (
      <div className="min-h-screen pt-8">
        <ProfileSkeleton />
        <div className="max-w-4xl mx-auto px-4 mt-8">
            <div className="grid grid-cols-3 gap-1">
                {Array.from({ length: 9 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-4/5" />
                ))}
            </div>
        </div>
      </div>
    );
  }

  // Unused because profile header UI is placeholder
  // const followersCount = Array.isArray(followers?.data) ? followers.data.length : 0;
  // const followingCount = Array.isArray(following?.data) ? following.data.length : 0;
  // const postsCount = posts?.data.meta.total || 0;

  if (isBlocked) {
      return (
          <div className="min-h-screen pt-20 text-center">
              <div className="glass-panel inline-block p-8 rounded-2xl">
                  <h2 className="text-2xl font-bold text-white">You have blocked this user.</h2>
                  <p className="text-gray-400 mt-2">Unblock them in Settings to see their profile.</p>
              </div>
          </div>
      );
  }

  // Helper to render grid
  const renderPostGrid = (items: Post[], emptyMessage: string, emptySubtext: string, icon: React.ReactNode) => {
    if (!items || items.length === 0) {
      return (
        <div className="text-center py-20">
            <div className="w-20 h-20 border-2 border-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            {icon}
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{emptyMessage}</h3>
            <p className="text-gray-400">{emptySubtext}</p>
        </div>
      );
    }
    return (
        <div className="grid grid-cols-3 gap-1">
            {items.map((post) => (
            <Link 
                key={post.id} 
                to={`/p/${post.id}`}
                className="aspect-4/5 relative group overflow-hidden bg-white/5"
            >
                {post.type === 'FRAME' && (
                    <div className="absolute top-2 right-2 z-10">
                        <Clapperboard size={16} className="text-white drop-shadow-md" />
                    </div>
                )}
                {post.media?.[0]?.type === 'video' || post.type === 'FRAME' ? (
                     <video
                        src={post.media?.[0]?.url}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        muted
                        playsInline
                        onMouseOver={e => e.currentTarget.play()}
                        onMouseOut={e => {
                            e.currentTarget.pause();
                            e.currentTarget.currentTime = 0;
                        }}
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                        }}
                     />
                ) : (
                    <img
                    src={post.media?.[0]?.url}
                    alt={post.caption || ''}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/300x400?text=No+Image';
                    }}
                    />
                )}
               
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 pointer-events-none">
                <div className="flex items-center gap-2 text-white font-bold">
                    <Heart size={20} fill="white" />
                    <span>{post._count?.likes || 0}</span>
                </div>
                <div className="flex items-center gap-2 text-white font-bold">
                    <MessageCircle size={20} fill="white" />
                    <span>{post._count?.comments || 0}</span>
                </div>
                </div>
            </Link>
            ))}
        </div>
    );
  };

  // Removed local state and queries that were moved to top level
  // However, doing this in render is risky. Let's use a side effect or just handle it in the tab change handler.
  // Actually, we can just leave it for now or move to useEffect if needed, but let's stick to the change:
  
  if (activeTab !== 'saved' && selectedCollection) {
     // This is a side effect in render, strictly speaking bad practice but often works. 
     // Better to reset in the onChange of the tab.
     // For now, I'll just keep the logic but maybe guard it better or accept it. 
     // But wait, "Too many re-renders" risk. 
     // I'll move this to the setActiveTab handlers or useEffect.
  }

  const renderSavedContent = () => {
    if (selectedCollection) {
        return (
            <div>
                <div className="flex items-center gap-4 mb-6">
                    <button type="button" 
                        onClick={() => setSelectedCollection(null)} 
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <h2 className="text-xl font-bold text-white">{selectedCollection.name}</h2>
                </div>
                {renderPostGrid(
                    savedPosts?.data.data || [],
                    'No posts yet',
                    'Save posts to this collection to see them here.',
                    <Bookmark size={32} className="text-white/40" />
                )}
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-center gap-4 mb-8">
                <button type="button"
                    onClick={() => setSavedTab('all')}
                    className={`px-6 py-2 rounded-full font-medium transition-colors ${savedTab === 'all' ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                    All Posts
                </button>
                <button type="button"
                    onClick={() => setSavedTab('collections')}
                    className={`px-6 py-2 rounded-full font-medium transition-colors ${savedTab === 'collections' ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                    Collections
                </button>
            </div>

            {savedTab === 'all' ? (
                renderPostGrid(
                    savedPosts?.data.data || [], 
                    'Save', 
                    'Save photos and videos that you want to see again.',
                    <Bookmark size={32} className="text-white/40" />
                )
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <button type="button"
                        onClick={() => setIsCreateCollectionModalOpen(true)}
                        className="aspect-square rounded-2xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-4 hover:bg-white/5 transition-colors group"
                    >
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                            <Plus size={24} className="text-white" />
                        </div>
                        <span className="font-semibold text-white">New Collection</span>
                    </button>
                    
                    {collections?.data.map((collection: Collection) => (
                        <CollectionCard 
                            key={collection.id} 
                            collection={collection} 
                            onClick={() => setSelectedCollection({ id: collection.id, name: collection.name })}
                        />
                    ))}
                </div>
            )}
        </div>
    );
  };

  return (
    <div className="min-h-screen pt-8 pb-32">
      <div className="max-w-4xl mx-auto px-4">
        {/* Profile Card */}
        <div className="glass-panel rounded-4xl p-6 md:p-8 mb-6 overflow-hidden relative group/header">
            {/* Background Accent Gradient */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-brand-primary/10 blur-[80px] -z-10 group-hover/header:bg-brand-primary/20 transition-all duration-700" />
            
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-10">
                {/* Avatar */}
                <div className="relative group/avatar">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full p-1 bg-linear-to-tr from-brand-primary via-brand-secondary to-brand-accent shadow-[0_0_15px_rgba(131,58,180,0.2)] group-hover/avatar:shadow-[0_0_25px_rgba(131,58,180,0.4)] transition-all duration-500">
                        <div className="w-full h-full rounded-full border-4 border-black overflow-hidden bg-zinc-900">
                            {profile.data.avatar ? (
                                <img 
                                    src={profile.data.avatar} 
                                    alt={profile.data.username} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover/avatar:scale-110"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                    <UserSquare2 size={56} strokeWidth={1} />
                                </div>
                            )}
                        </div>
                    </div>
                    {isMe && (
                        <Link 
                            to="/accounts/edit" 
                            className="absolute bottom-2 right-2 p-2.5 bg-zinc-900 border border-white/10 rounded-full text-white hover:bg-zinc-800 transition-colors shadow-xl opacity-0 group-hover/avatar:opacity-100 translate-y-2 group-hover/avatar:translate-y-0 duration-300"
                        >
                            <Plus size={16} />
                        </Link>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left pt-1">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 mb-6">
                        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                            {profile.data.username}
                        </h1>
                        <div className="flex items-center justify-center md:justify-start gap-2.5">
                            {isMe ? (
                                <>
                                    <Link 
                                        to="/accounts/edit" 
                                        className="px-6 py-2 bg-white text-black hover:bg-zinc-200 rounded-lg font-bold transition-all hover:scale-105 active:scale-95 text-sm"
                                    >
                                        Edit Profile
                                    </Link>
                                    <button type="button" className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/5 transition-all">
                                        <Settings size={18} />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <FollowButton username={profile.data.username} />
                                    <button type="button" className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/5 font-bold transition-all hover:scale-105 active:scale-95 text-sm">
                                        Message
                                    </button>
                                    <div className="relative">
                                        <button type="button" 
                                            onClick={() => setShowMenu(!showMenu)}
                                            className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/5 transition-all"
                                        >
                                            <MoreHorizontal size={18} />
                                        </button>
                                        
                                        {showMenu && (
                                            <div className="absolute top-full mt-2 right-0 bg-[#262626] border border-white/10 rounded-xl shadow-xl overflow-hidden min-w-[160px] z-50">
                                                <button type="button" 
                                                    onClick={() => {
                                                        setShowMenu(false);
                                                        setShowReportModal(true);
                                                    }}
                                                    className="w-full text-left px-4 py-3 text-red-400 hover:bg-white/5 flex items-center gap-2 font-medium"
                                                >
                                                    <Flag size={16} />
                                                    Report
                                                </button>
                                                <button type="button" 
                                                    className="w-full text-left px-4 py-3 text-red-400 hover:bg-white/5 flex items-center gap-2 font-medium"
                                                    onClick={() => {
                                                        setShowMenu(false);
                                                        setShowBlockModal(true);
                                                    }}
                                                >
                                                    <Ban size={16} />
                                                    Block
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex justify-center md:justify-start gap-10 mb-6">
                        <div className="text-center md:text-left group/stat cursor-pointer">
                            <span className="block text-white font-black text-lg md:text-xl group-hover:text-brand-primary transition-colors">
                                {profile.data.user?._count?.posts || 0}
                            </span>
                            <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Posts</span>
                        </div>
                        <button type="button" 
                            onClick={() => setShowFollowsModal('followers')}
                            className="text-center md:text-left group/stat"
                        >
                            <span className="block text-white font-black text-lg md:text-xl group-hover:text-brand-secondary transition-colors">
                                {profile.data.user?._count?.followers || 0}
                            </span>
                            <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Followers</span>
                        </button>
                        <button type="button" 
                            onClick={() => setShowFollowsModal('following')}
                            className="text-center md:text-left group/stat"
                        >
                            <span className="block text-white font-black text-lg md:text-xl group-hover:text-brand-accent transition-colors">
                                {profile.data.user?._count?.following || 0}
                            </span>
                            <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Following</span>
                        </button>
                    </div>

                    {/* Bio */}
                    <div className="max-w-xl">
                        <h2 className="font-black text-white text-base mb-0.5 tracking-tight">{profile.data.fullName}</h2>
                        <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap mb-3">{profile.data.bio}</p>
                        
                        {(profile.data.website || profile.data.location) && (
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm font-medium">
                                {profile.data.location && (
                                    <span className="flex items-center gap-1.5 text-zinc-500">
                                        <MapPin size={14} className="text-brand-secondary" />
                                        {profile.data.location}
                                    </span>
                                )}
                                {profile.data.website && (
                                    <a 
                                        href={profile.data.website.startsWith('http') ? profile.data.website : `https://${profile.data.website}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 text-brand-blue hover:underline decoration-2 underline-offset-4"
                                    >
                                        <LinkIcon size={14} />
                                        {profile.data.website.replace(/^https?:\/\/(www\.)?/, '')}
                                        <ExternalLink size={12} className="opacity-50" />
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* Story Highlights */}
        {((highlights?.data && highlights.data.length > 0) || isMe) && (
            <div className="flex items-center gap-6 overflow-x-auto pb-6 mb-6 no-scrollbar border-b border-white/5 scroll-smooth">
                {isMe && (
                    <HighlightBubble 
                        id="new" 
                        title="New" 
                        isAddButton 
                        onClick={() => setIsHighlightModalOpen(true)} 
                    />
                )}
                {highlights?.data?.map((highlight) => (
                    <HighlightBubble
                        key={highlight.id}
                        id={highlight.id}
                        title={highlight.title}
                        coverUrl={highlight.coverUrl || undefined}
                    />
                ))}
            </div>
        )}

        {/* Modals */}
        <CreateHighlightModal 
            isOpen={isHighlightModalOpen} 
            onClose={() => setIsHighlightModalOpen(false)} 
        />
        <CreateCollectionModal
            isOpen={isCreateCollectionModalOpen}
            onClose={() => setIsCreateCollectionModalOpen(false)}
        />
        {showFollowsModal && (
            <FollowersModal
                title={showFollowsModal}
                users={(followList?.data as UserWithProfile[])?.map(u => u.profile) || []}
                onClose={() => setShowFollowsModal(null)}
            />
        )}

        {/* Tabs */}
        {canView && (
          <div className="border-t border-white/10 flex justify-center gap-12 mb-4">
             <button type="button"
                onClick={() => setActiveTab('posts')}
                className={`border-t -mr-px md:mr-0 inline-block py-3 text-xs font-semibold tracking-widest uppercase items-center gap-2 ${
                  activeTab === 'posts' ? 'border-white text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
             >
               <span className="flex items-center gap-2">
                 <Grid size={12} />
                 <span>POSTS</span>
               </span>
             </button>
             <button type="button"
                onClick={() => setActiveTab('frames')}
                className={`border-t -mr-px md:mr-0 inline-block py-3 text-xs font-semibold tracking-widest uppercase items-center gap-2 ${
                  activeTab === 'frames' ? 'border-white text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
             >
                <span className="flex items-center gap-2">
                 <Clapperboard size={12} />
                 <span>FRAMES</span>
               </span>
             </button>
             {isMe && (
               <button type="button"
                  onClick={() => setActiveTab('saved')}
                  className={`border-t -mr-px md:mr-0 inline-block py-3 text-xs font-semibold tracking-widest uppercase items-center gap-2 ${
                    activeTab === 'saved' ? 'border-white text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
                  }`}
               >
                 <span className="flex items-center gap-2">
                   <Bookmark size={12} />
                   <span>SAVED</span>
                 </span>
               </button>
             )}
              <button type="button"
                onClick={() => setActiveTab('tagged')}
                className={`border-t -mr-px md:mr-0 inline-block py-3 text-xs font-semibold tracking-widest uppercase items-center gap-2 ${
                  activeTab === 'tagged' ? 'border-white text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
             >
               <span className="flex items-center gap-2">
                 <UserSquare2 size={12} />
                 <span>TAGGED</span>
               </span>
             </button>
          </div>
        )}

        {/* Content Area */}
        {canView ? (
          <>
            {activeTab === 'posts' && renderPostGrid(
                posts?.data.data || [], 
                isMe ? 'Share Photos' : 'No Posts Yet',
                isMe ? 'When you share photos, they will appear on your profile.' : '',
                <svg className="w-10 h-10 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            )}

            {activeTab === 'frames' && renderPostGrid(
                frames?.data.data || [], 
                'Frames', 
                'Share short looping videos.',
                <Clapperboard size={32} className="text-white/40" />
            )}

            {activeTab === 'saved' && renderSavedContent()}
            
            {activeTab === 'tagged' && renderPostGrid(
                taggedPosts?.data.data || [], 
                `Photos of ${isMe ? 'you' : profile.data.username}`, 
                `When people tag ${isMe ? 'you' : 'them'} in photos, they'll appear here.`,
                <UserSquare2 size={32} className="text-white/40" />
            )}
          </>
        ) : (
          /* Private Account View */
          <div className="glass-panel rounded-3xl p-12 text-center">
             {/* ... */}
          </div>
        )}
      </div>

      {/* ... Other Modals ... */}
      <ReportModal 
        isOpen={showReportModal} 
        onClose={() => setShowReportModal(false)} 
        targetType="user" 
        targetId={profile.data.userId} 
      />
      <BlockModal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        username={profile.data.username}
      />
    </div>
  );
}
