import { useState, useRef, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profileApi, followsApi, uploadApi } from '../services';
import type { Profile, UpdateProfileDto } from '../types';
import { useAuthStore } from '../stores/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { User, Shield, UserX, AlertTriangle, LogOut, Camera, Check, X, Loader2, UserPlus, Star, Key } from 'lucide-react';
import CloseFriendsModal from '../components/modals/CloseFriendsModal';
import { PasskeySettings } from '../components';
import { logger } from '../utils/logger';

// Debounce hook
function useDebounce<T extends (...args: Parameters<T>) => void>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
}

export default function Settings() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const setProfile = useAuthStore((state) => state.setProfile);
  const [activeTab, setActiveTab] = useState<'profile' | 'privacy' | 'security' | 'requests' | 'mutes' | 'account' | 'close_friends'>('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Profile Data ---
  const { data: profileData } = useQuery({
    queryKey: ['myProfile'],
    queryFn: () => profileApi.getMyProfile(),
  });
  const profile = profileData?.data;

  // --- Blocked Users Data ---
  const { data: blockedUsersData, refetch: refetchBlocked } = useQuery({
    queryKey: ['blockedUsers'],
    queryFn: () => followsApi.getBlocked(),
    enabled: activeTab === 'mutes',
  });
  const blockedUsers = blockedUsersData?.data || [];

  // --- Pending Follow Requests ---
  const { data: pendingRequestsData, refetch: refetchPending } = useQuery({
    queryKey: ['pendingFollowRequests'],
    queryFn: () => followsApi.getPending(),
    enabled: activeTab === 'requests',
  });
  const pendingRequests = pendingRequestsData?.data || [];

  // --- Form State ---
  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [website, setWebsite] = useState(profile?.website || '');
  const [isPrivate, setIsPrivate] = useState(profile?.isPrivate || false);
  const [initialized, setInitialized] = useState(false);
  
  // Username availability state
  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean;
    available: boolean | null;
    message: string;
  }>({ checking: false, available: null, message: '' });
  
  // Avatar upload state
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarSuccess, setAvatarSuccess] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Sync form state when profile loads
  if (profile && !initialized) {
    setFullName(profile.fullName || '');
    setUsername(profile.username || '');
    setBio(profile.bio || '');
    setWebsite(profile.website || '');
    setIsPrivate(profile.isPrivate || false);
    setInitialized(true);
  }

  // Check username availability
  const checkUsernameAvailability = useCallback(async (newUsername: string) => {
    if (!newUsername || newUsername === profile?.username) {
      setUsernameStatus({ checking: false, available: null, message: '' });
      return;
    }
    
    if (newUsername.length < 3) {
      setUsernameStatus({ checking: false, available: false, message: 'Username must be at least 3 characters' });
      return;
    }

    setUsernameStatus({ checking: true, available: null, message: '' });
    
    try {
      const response = await profileApi.checkUsername(newUsername);
      setUsernameStatus({
        checking: false,
        available: response.data.available,
        message: response.data.message,
      });
    } catch {
      setUsernameStatus({ checking: false, available: false, message: 'Error checking username' });
    }
  }, [profile?.username]);

  const debouncedCheckUsername = useDebounce(checkUsernameAvailability, 500);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, '');
    setUsername(value);
    debouncedCheckUsername(value);
  };

  // Avatar upload handler
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setAvatarUploading(true);
    setAvatarSuccess(false);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await uploadApi.upload(formData);
      const avatarUrl = response.data.url;
      
      // Update profile with new avatar
      await profileApi.updateProfile({ avatar: avatarUrl });
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
      
      // Update auth store
      if (profile) {
        setProfile({ ...profile, avatar: avatarUrl });
      }
      setAvatarSuccess(true);
      setTimeout(() => setAvatarSuccess(false), 3000);
    } catch (error) {
      logger.error('Failed to upload avatar:', error);
      setAvatarPreview(null);
    } finally {
      setAvatarUploading(false);
    }
  };

  // --- Mutations ---
  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileDto) => 
      profileApi.updateProfile(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
      setProfile(response.data);
      // If username changed, navigate to new profile URL
      if (response.data.username !== profile?.username) {
        navigate(`/${response.data.username}`);
      }
    },
  });

  const unblockMutation = useMutation({
    mutationFn: (targetUsername: string) => followsApi.unblock(targetUsername),
    onSuccess: () => {
      refetchBlocked();
    },
  });

  const acceptRequestMutation = useMutation({
    mutationFn: (username: string) => followsApi.acceptRequest(username),
    onSuccess: () => {
      refetchPending();
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
    },
  });

  const rejectRequestMutation = useMutation({
    mutationFn: (username: string) => followsApi.rejectRequest(username),
    onSuccess: () => {
      refetchPending();
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: () => profileApi.deactivateAccount(),
    onSuccess: () => {
      logout();
      navigate('/accounts/login');
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: () => profileApi.deleteAccount(),
    onSuccess: () => {
      logout();
      navigate('/accounts/login');
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: { fullName?: string; bio?: string; website?: string | null; isPrivate?: boolean; username?: string } = {
      fullName,
      bio,
      isPrivate,
    };

    if (website && website.trim() !== '') {
      data.website = website;
    } else {
      data.website = null;
    }

    // Only include username if it changed and is available
    if (username !== profile?.username && usernameStatus.available) {
      data.username = username;
    }

    updateProfileMutation.mutate(data);
  };

  const handlePrivacyToggle = () => {
    updateProfileMutation.mutate({ 
      fullName, 
      bio, 
      website, 
      isPrivate: !isPrivate 
    });
  };

  const handleDeactivate = () => {
    if (window.confirm('Are you sure you want to deactivate your account? You can reactivate it by logging in again.')) {
      deactivateMutation.mutate();
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to PERMANENTLY delete your account? This action cannot be undone.')) {
      deleteAccountMutation.mutate();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/accounts/login');
  };

  const tabs = [
    { id: 'profile', label: 'Edit profile', icon: User },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'security', label: 'Security', icon: Key },
    { id: 'requests', label: 'Requests', icon: UserPlus },
    { id: 'close_friends', label: 'Close Friends', icon: Star },
    { id: 'mutes', label: 'Blocked', icon: UserX },
    { id: 'account', label: 'Account', icon: AlertTriangle },
  ] as const;

  const canSubmit = username === profile?.username || (usernameStatus.available === true);

  return (
    <div className="min-h-screen pb-32">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <button type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"
          >
            <LogOut size={18} />
            <span className="font-medium">Log out</span>
          </button>
        </div>
        
        <div className="glass-panel rounded-2xl overflow-hidden flex flex-col md:flex-row min-h-[500px]">
          {/* Sidebar / Tabs */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 p-2 md:p-4">
            <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible">
              {tabs.map((tab) => (
                <button type="button"
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition whitespace-nowrap ${
                    activeTab === tab.id 
                      ? 'bg-white/10 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <tab.icon size={18} />
                  <span className="hidden md:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 md:p-8">
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSubmit} className="space-y-6 max-w-lg">
                {/* Avatar Section */}
                <div className="flex items-center gap-6 mb-8">
                  <div className="relative group">
                    <img
                      src={avatarPreview || profile?.avatar || 'https://via.placeholder.com/80'}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover border-2 border-white/20"
                    />
                    {avatarUploading ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                        <Loader2 size={24} className="text-white animate-spin" />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Camera size={24} className="text-white" />
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{profile?.username}</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-sm text-blue-400 hover:text-blue-300 font-semibold"
                      disabled={avatarUploading}
                    >
                      {avatarUploading ? 'Uploading...' : 'Change profile photo'}
                    </button>
                    {avatarSuccess && (
                      <span className="ml-3 text-sm text-green-400 animate-fade-in">
                        Photo updated!
                      </span>
                    )}
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Username</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={username}
                      onChange={handleUsernameChange}
                      className={`w-full px-4 py-3 bg-white/5 border rounded-lg focus:ring-2 focus:ring-purple-500/50 focus:border-transparent outline-none text-white placeholder-gray-500 pr-10 ${
                        usernameStatus.available === true ? 'border-green-500/50' :
                        usernameStatus.available === false ? 'border-red-500/50' :
                        'border-white/10'
                      }`}
                      placeholder="username"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {usernameStatus.checking && (
                        <Loader2 size={18} className="text-gray-400 animate-spin" />
                      )}
                      {!usernameStatus.checking && usernameStatus.available === true && (
                        <Check size={18} className="text-green-500" />
                      )}
                      {!usernameStatus.checking && usernameStatus.available === false && (
                        <X size={18} className="text-red-500" />
                      )}
                    </div>
                  </div>
                  {usernameStatus.message && (
                    <p className={`text-xs mt-1 ${usernameStatus.available ? 'text-green-400' : 'text-red-400'}`}>
                      {usernameStatus.message}
                    </p>
                  )}
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500/50 focus:border-transparent outline-none text-white placeholder-gray-500"
                    placeholder="Your name"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    maxLength={150}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500/50 focus:border-transparent outline-none resize-none text-white placeholder-gray-500"
                    placeholder="Tell us about yourself"
                  />
                  <p className="text-xs text-gray-500 mt-1">{bio.length}/150</p>
                </div>

                {/* Website */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Website</label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500/50 focus:border-transparent outline-none text-white placeholder-gray-500"
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                {updateProfileMutation.isSuccess && (
                  <div className="text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    Profile updated successfully!
                  </div>
                )}

                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending || !canSubmit}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateProfileMutation.isPending ? 'Saving...' : 'Submit'}
                </button>
              </form>
            )}

            {activeTab === 'privacy' && (
              <div className="max-w-lg space-y-6">
                <h2 className="text-xl font-bold text-white mb-6">Privacy</h2>
                
                <div className="glass-panel p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white">Private account</h3>
                      <p className="text-sm text-gray-400 mt-1">
                        When your account is private, only people you approve can see your photos and videos.
                      </p>
                    </div>
                    <button type="button"
                      onClick={handlePrivacyToggle}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        isPrivate ? 'bg-blue-500' : 'bg-white/20'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isPrivate ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'requests' && (
              <div className="max-w-lg">
                <h2 className="text-xl font-bold text-white mb-6">Follow requests</h2>
                
                {pendingRequests.length === 0 ? (
                  <div className="text-center text-gray-400 py-10">
                    <UserPlus size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No pending follow requests.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingRequests.map((user: { id: string; profile?: Profile }) => (
                      <div key={user.id} className="glass-panel flex items-center justify-between p-4 rounded-xl">
                        <Link to={`/${user.profile?.username}`} className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-white/10 overflow-hidden">
                            {user.profile?.avatar ? (
                              <img src={user.profile.avatar} alt={user.profile?.username} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-linear-to-br from-purple-400 to-pink-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{user.profile?.fullName || user.profile?.username}</p>
                            <p className="text-sm text-gray-400">@{user.profile?.username}</p>
                          </div>
                        </Link>
                        <div className="flex gap-2">
                          <button type="button"
                            onClick={() => user.profile?.username && acceptRequestMutation.mutate(user.profile.username)}
                            disabled={acceptRequestMutation.isPending}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition"
                          >
                            Accept
                          </button>
                          <button type="button"
                            onClick={() => user.profile?.username && rejectRequestMutation.mutate(user.profile.username)}
                            disabled={rejectRequestMutation.isPending}
                            className="px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg transition"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'mutes' && (
              <div className="max-w-lg">
                <h2 className="text-xl font-bold text-white mb-6">Blocked accounts</h2>
                
                {blockedUsers.length === 0 ? (
                  <div className="text-center text-gray-400 py-10">
                    <UserX size={48} className="mx-auto mb-4 opacity-50" />
                    <p>You haven't blocked anyone.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {blockedUsers.map((user: { id: string; username?: string; profile?: Profile }) => (
                      <div key={user.id} className="glass-panel flex items-center justify-between p-4 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-white/10 overflow-hidden">
                            {user.profile?.avatar ? (
                              <img src={user.profile.avatar} alt={user.username} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-linear-to-br from-purple-400 to-pink-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{user.profile?.username || 'Unknown'}</p>
                            <p className="text-sm text-gray-400">{user.profile?.fullName}</p>
                          </div>
                        </div>
                        <button type="button"
                          onClick={() => user.profile?.username && unblockMutation.mutate(user.profile.username)}
                          className="px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg transition"
                        >
                          Unblock
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'account' && (
              <div className="max-w-lg space-y-6">
                <h2 className="text-xl font-bold text-white mb-6">Account</h2>

                <div className="glass-panel p-4 rounded-xl border border-yellow-500/20">
                  <h3 className="font-semibold text-yellow-400">Temporarily disable account</h3>
                  <p className="text-sm text-gray-400 mt-2 mb-4">
                    Your profile and posts will be hidden until you log back in.
                  </p>
                  <button type="button"
                    onClick={handleDeactivate}
                    disabled={deactivateMutation.isPending}
                    className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg font-medium hover:bg-yellow-500/30 transition"
                  >
                    {deactivateMutation.isPending ? 'Disabling...' : 'Temporarily disable account'}
                  </button>
                </div>

                <div className="glass-panel p-4 rounded-xl border border-red-500/20">
                  <h3 className="font-semibold text-red-400">Delete account</h3>
                  <p className="text-sm text-gray-400 mt-2 mb-4">
                    Permanently delete your account and all your data. This cannot be undone.
                  </p>
                  <button type="button"
                    onClick={handleDelete}
                    disabled={deleteAccountMutation.isPending}
                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg font-medium hover:bg-red-500/30 transition"
                  >
                    {deleteAccountMutation.isPending ? 'Deleting...' : 'Delete account'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'close_friends' && (
             <CloseFriendsModal onClose={() => setActiveTab('profile')} /> 
            )}

            {activeTab === 'security' && (
              <div className="max-w-lg space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Security</h2>
                  <p className="text-gray-400 text-sm italic">Enhance your account protection with next-gen authentication.</p>
                </div>
                <PasskeySettings />
              </div>
            )}
          </div>
        </div>

        {/* Back to profile link */}
        {profile?.username && (
          <div className="mt-6 text-center">
            <Link 
              to={`/${profile.username}`}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Back to profile
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
