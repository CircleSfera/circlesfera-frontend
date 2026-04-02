import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profileApi, followsApi, uploadApi } from '../services';
import type { Profile, UpdateProfileDto } from '../types';
import { useAuthStore } from '../stores/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { User, Shield, UserX, AlertTriangle, LogOut, Camera, Check, X, Loader2, UserPlus, Star, Key, BarChart3 } from 'lucide-react';
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
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [accountType, setAccountType] = useState<'PERSONAL' | 'CREATOR' | 'BUSINESS'>('PERSONAL');
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

  // --- Mutations ---
  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileDto) => 
      profileApi.updateProfile(data),
    onSuccess: (response) => {
      queryClient.setQueryData(['myProfile'], response); // Optimistic cache update
      setProfile(response.data);
      
      // Update local states if they match the response
      setFullName(response.data.fullName || '');
      setUsername(response.data.username || '');
      setBio(response.data.bio || '');
      setWebsite(response.data.website || '');
      setIsPrivate(response.data.isPrivate || false);
      
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

  // --- Synchronization Effects ---
  useEffect(() => {
    if (profile && !initialized) {
      setFullName(profile.fullName || '');
      setUsername(profile.username || '');
      setBio(profile.bio || '');
      setWebsite(profile.website || '');
      setIsPrivate(profile.isPrivate || false);
      setAccountType(profile.user?.accountType || 'PERSONAL');
      setInitialized(true);
    }
  }, [profile, initialized]);


  // --- Handlers ---
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

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setAvatarUploading(true);
    setAvatarSuccess(false);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await uploadApi.upload(formData);
      const avatarUrl = response.data.url;
      
      await profileApi.updateProfile({ avatar: avatarUrl });
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
      
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

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: UpdateProfileDto = {
      fullName,
      bio,
      isPrivate,
    };

    if (website && website.trim() !== '') {
      data.website = website;
    } else {
      data.website = null;
    }

    if (username !== profile?.username && usernameStatus.available) {
      data.username = username;
    }

    updateProfileMutation.mutate(data);
  };

  const handlePrivacyToggle = () => {
    const newPrivateValue = !isPrivate;
    setIsPrivate(newPrivateValue); // Optimistic UI update
    
    const normalizedWebsite = website && website.trim() !== '' ? website : null;
    updateProfileMutation.mutate({ 
      fullName, 
      bio, 
      website: normalizedWebsite, 
      isPrivate: newPrivateValue 
    }, {
      onError: (error) => {
        setIsPrivate(!newPrivateValue); // Revert on failure
        logger.error('Failed to update privacy settings:', error);
      }
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
    { id: 'profile', label: 'Edit Profile', desc: 'Your public presence', icon: User },
    { id: 'privacy', label: 'Privacy', desc: 'Control your visibility', icon: Shield },
    { id: 'security', label: 'Security', desc: 'Next-gen authentication', icon: Key },
    { id: 'requests', label: 'Follow Requests', desc: 'Manage connections', icon: UserPlus },
    { id: 'close_friends', label: 'Close Friends', desc: 'Your inner circle', icon: Star },
    { id: 'mutes', label: 'Blocked Accounts', desc: 'Restricted interactions', icon: UserX },
    { id: 'account', label: 'Account Management', desc: 'Deactivation & Deletion', icon: AlertTriangle },
  ] as const;

  const canSubmit = username === profile?.username || (usernameStatus.available === true);

  return (
    <div className="min-h-screen pb-32 pt-6">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">Settings</h1>
            <p className="text-gray-400 mt-1 font-medium italic">Configure your CircleSfera experience</p>
          </div>
          <motion.button type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 transition-all self-start md:self-auto"
          >
            <LogOut size={18} />
            <span className="font-bold text-sm tracking-wide">LOG OUT</span>
          </motion.button>
        </div>

        <div className="glass-panel rounded-3xl overflow-hidden flex flex-col md:flex-row min-h-0 border-white/5 shadow-2xl relative">
          {/* Mobile Tabs / Desktop Sidebar */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/5 bg-zinc-950/50 md:bg-white/1 shrink-0 sticky top-0 md:top-0 z-20 md:z-10 backdrop-blur-xl md:backdrop-blur-none">
            <div className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible no-scrollbar p-2 md:p-4 sticky md:top-24">
              {tabs.map((tab) => (
                <button type="button"
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-start gap-0 px-3.5 py-2.5 rounded-xl transition-all relative group ${
                    activeTab === tab.id 
                      ? 'bg-white/10 text-white shadow-md shadow-black/10 ring-1 ring-white/5' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <tab.icon size={16} className={activeTab === tab.id ? 'text-blue-400' : 'group-hover:text-blue-300 transition-colors'} />
                    <span className="font-bold text-[11px] tracking-wide uppercase truncate">{tab.label}</span>
                  </div>
                  <span className={`hidden md:inline text-[9px] ml-6.5 font-medium leading-none ${activeTab === tab.id ? 'text-blue-400/60' : 'text-gray-500'}`}>
                    {tab.desc}
                  </span>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full hidden md:block"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 md:p-8">
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSubmit} className="space-y-8 max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Avatar Section */}
                <div className="flex flex-col sm:flex-row items-center gap-8 bg-white/1 p-6 rounded-3xl border border-white/5 shadow-inner">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/10 group-hover:border-blue-500/50 transition-all duration-300 relative bg-zinc-800">
                      <img
                        src={avatarPreview || profile?.avatar || '#noimage'}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5">
                        <Camera size={20} className="text-white" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Change</span>
                      </div>
                    </div>
                    {avatarUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full z-10">
                        <Loader2 size={24} className="text-blue-400 animate-spin" />
                      </div>
                    )}
                    {avatarSuccess && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1.5 rounded-full shadow-lg border-2 border-zinc-900"
                      >
                        <Check size={14} strokeWidth={4} />
                      </motion.div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </div>

                  <div className="flex-1 text-center sm:text-left space-y-2">
                    <h3 className="text-xl font-bold text-white tracking-tight">@{profile?.username}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
                      Update your profile picture to personalize your CircleSfera experience.
                    </p>
                    <div className="flex items-center justify-center sm:justify-start gap-4 pt-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[11px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors bg-blue-400/5 hover:bg-blue-400/10 px-4 py-2 rounded-full border border-blue-400/10"
                        disabled={avatarUploading}
                      >
                        {avatarUploading ? 'Uploading...' : 'Upload New'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Section 1: Public Identity */}
                <div className="bg-white/2 p-5 md:p-6 rounded-3xl border border-white/5 space-y-6">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-400/80 mb-2">Public Identity</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Username */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Username</label>
                      <div className="relative group">
                        <input
                          type="text"
                          value={username}
                          onChange={handleUsernameChange}
                          className={`w-full px-5 py-3.5 bg-zinc-900/50 border-2 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none text-white transition-all font-medium ${
                            usernameStatus.available === true ? 'border-green-500/30' :
                            usernameStatus.available === false ? 'border-red-500/30' :
                            'border-white/5 focus:border-blue-500/40 group-hover:border-white/10'
                          }`}
                          placeholder="username"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          {usernameStatus.checking && <Loader2 size={18} className="text-blue-400 animate-spin" />}
                          {!usernameStatus.checking && usernameStatus.available === true && <Check size={18} className="text-green-400" />}
                          {!usernameStatus.checking && usernameStatus.available === false && <X size={18} className="text-red-400" />}
                        </div>
                      </div>
                      {usernameStatus.message && (
                        <p className={`text-[10px] font-bold mt-1 ml-1 tracking-wide ${usernameStatus.available ? 'text-green-400' : 'text-red-400'}`}>
                          {usernameStatus.message.toUpperCase()}
                        </p>
                      )}
                    </div>

                    {/* Name */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Display Name</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-5 py-3.5 bg-zinc-900/50 border-2 border-white/5 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 outline-none text-white transition-all font-medium hover:border-white/10"
                        placeholder="Your name"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Presence & Links */}
                <div className="bg-white/2 p-5 md:p-6 rounded-3xl border border-white/5 space-y-6">
                   <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-400/80 mb-2">Presence & Links</h3>
                   <div className="space-y-6">
                      {/* Bio */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-end ml-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Bio</label>
                          <span className={`text-[10px] font-bold ${bio.length >= 140 ? 'text-red-400' : 'text-gray-600'}`}>{bio.length}/150</span>
                        </div>
                        <textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          rows={3}
                          maxLength={150}
                          className="w-full px-5 py-3.5 bg-zinc-900/50 border-2 border-white/5 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 outline-none text-white transition-all font-medium hover:border-white/10 resize-none h-28"
                          placeholder="Tell the world your story..."
                        />
                      </div>

                      {/* Website */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Website</label>
                        <input
                          type="url"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          className="w-full px-5 py-3.5 bg-zinc-900/50 border-2 border-white/5 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 outline-none text-white transition-all font-medium hover:border-white/10"
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                   </div>
                </div>

                {/* Section 3: Professional Account (Already in cards) */}
                <div className="bg-white/2 p-5 md:p-6 rounded-3xl border border-white/5 space-y-4">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-[11px] font-black uppercase tracking-widest text-blue-400/80">Account Type</label>
                    <span className="text-[10px] font-bold text-blue-400 capitalize bg-blue-400/10 px-2 py-0.5 rounded-full">{accountType.toLowerCase()}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'PERSONAL', icon: User, label: 'Personal', desc: 'Private use' },
                      { id: 'CREATOR', icon: Star, label: 'Creator', desc: 'Best for artists' },
                      { id: 'BUSINESS', icon: BarChart3, label: 'Business', desc: 'Brand tools' },
                    ].map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => {
                          const typeId = type.id as 'PERSONAL' | 'CREATOR' | 'BUSINESS';
                          setAccountType(typeId);
                          updateProfileMutation.mutate({ accountType: typeId });
                        }}
                        className={`relative p-4 rounded-2xl text-left transition-all duration-300 border group overflow-hidden ${
                          accountType === type.id
                            ? 'bg-blue-500/10 border-blue-500/50 shadow-lg shadow-blue-500/10'
                            : 'bg-zinc-900/40 border-white/5 hover:border-white/10'
                        }`}
                      >
                        {accountType === type.id && (
                          <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full shadow-lg">
                            <Check size={8} strokeWidth={4} />
                          </div>
                        )}
                        <type.icon size={18} className={`mb-2 ${accountType === type.id ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-400 transition-colors'}`} />
                        <h4 className={`text-xs font-bold tracking-tight ${accountType === type.id ? 'text-white' : 'text-gray-400'}`}>{type.label}</h4>
                        <p className={`text-[8px] font-bold uppercase tracking-wider mt-0.5 ${accountType === type.id ? 'text-blue-400/80' : 'text-gray-600'}`}>
                          {type.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <AnimatePresence>
                  {updateProfileMutation.isSuccess && (
                    <motion.div 
                      key="success-msg"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-2xl p-4 shadow-lg shadow-green-500/5"
                    >
                      <Check size={18} />
                      <span className="font-bold tracking-tight text-[10px] uppercase">Profile Updated Successfully</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Sticky Guard Bar (Mobile Footer) */}
                <div className="sticky bottom-0 md:static -mx-6 md:mx-0 p-4 md:p-0 mt-8 z-30 bg-zinc-950/80 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none border-t border-white/5 md:border-none">
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    disabled={updateProfileMutation.isPending || !canSubmit}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale"
                  >
                    {updateProfileMutation.isPending ? 'Saving Changes...' : 'Save Profile Changes'}
                  </motion.button>
                </div>
              </form>
            )}

            {activeTab === 'privacy' && (
              <div className="max-w-xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tighter">Privacy</h2>
                  <p className="text-gray-400 text-sm font-medium mt-1 uppercase tracking-widest italic opacity-60">Visibility & Control</p>
                </div>
                
                <div className="bg-white/2 p-6 rounded-3xl border border-white/5 border-l-blue-500/40 border-l-4">
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white tracking-tight">Private Account</h3>
                      <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                        When your account is private, only people you approve can see your posts and stories.
                      </p>
                    </div>
                    <button type="button"
                      onClick={handlePrivacyToggle}
                      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-all duration-300 focus:outline-none ring-offset-2 ring-offset-zinc-900 focus:ring-2 focus:ring-blue-500/50 ${
                        isPrivate ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-white/10'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                          isPrivate ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'requests' && (
              <div className="max-w-xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tighter">Follow Requests</h2>
                  <p className="text-gray-400 text-sm font-medium mt-1 uppercase tracking-widest italic opacity-60">Manage Connections</p>
                </div>
                
                {pendingRequests.length === 0 ? (
                  <div className="text-center py-16 bg-white/1 rounded-3xl border border-white/5 border-dashed">
                    <UserPlus size={48} className="mx-auto mb-4 text-gray-700" />
                    <p className="text-gray-500 font-bold tracking-tight uppercase text-xs">No pending requests at the moment</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingRequests.map((user: { id: string; profile?: Profile }) => (
                      <div key={user.id} className="bg-white/2 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                          <Link to={`/${user.profile?.username}`} className="flex items-center gap-4 self-start">
                            <div className="w-12 h-12 rounded-full bg-zinc-800 overflow-hidden border border-white/10">
                              {user.profile?.avatar ? (
                                <img src={user.profile.avatar} alt={user.profile?.username} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-linear-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                                  <User size={20} className="text-white/20" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-white tracking-tight leading-none mb-1">{user.profile?.fullName || user.profile?.username}</p>
                              <p className="text-[11px] font-medium text-blue-400/60 uppercase tracking-wider">@{user.profile?.username}</p>
                            </div>
                          </Link>
                          <div className="flex gap-2 w-full sm:w-auto">
                            <button type="button"
                              onClick={() => user.profile?.username && acceptRequestMutation.mutate(user.profile.username)}
                              disabled={acceptRequestMutation.isPending}
                              className="flex-1 sm:flex-none px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-white bg-blue-500 hover:bg-blue-600 rounded-xl transition-all shadow-lg shadow-blue-500/10"
                            >
                              Confirm
                            </button>
                            <button type="button"
                              onClick={() => user.profile?.username && rejectRequestMutation.mutate(user.profile.username)}
                              disabled={rejectRequestMutation.isPending}
                              className="flex-1 sm:flex-none px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                            >
                              Delete
                            </button>
                          </div>
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
                      <div key={user.id} className="bg-white/2 border border-white/5 flex items-center justify-between p-4 rounded-2xl">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-zinc-800 overflow-hidden border border-white/10">
                            {user.profile?.avatar ? (
                              <img src={user.profile.avatar} alt={user.username} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-linear-to-br from-zinc-700 to-zinc-900" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-white tracking-tight leading-none mb-1">{user.profile?.username || 'Unknown'}</p>
                            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-widest">{user.profile?.fullName}</p>
                          </div>
                        </div>
                        <button type="button"
                          onClick={() => user.profile?.username && unblockMutation.mutate(user.profile.username)}
                          className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
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
              <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tighter">Account Management</h2>
                  <p className="text-gray-400 text-sm font-medium mt-1 uppercase tracking-widest italic opacity-60">Control your account status</p>
                </div>
 
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-orange-500/5 p-6 rounded-3xl border border-orange-500/10 hover:bg-orange-500/10 transition-colors group">
                    <h3 className="font-bold text-orange-400 uppercase tracking-widest text-[11px] mb-2 flex items-center gap-2">
                       <AlertTriangle size={14} /> Temporary Disable
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed font-medium mb-5">
                      Your profile and posts will be hidden until you log back in.
                    </p>
                    <button type="button"
                      onClick={handleDeactivate}
                      disabled={deactivateMutation.isPending}
                      className="w-full px-5 py-3 bg-orange-500/10 text-orange-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-400 hover:text-white transition-all disabled:opacity-50"
                    >
                      {deactivateMutation.isPending ? 'DISABLING...' : 'DISABLE ACCOUNT'}
                    </button>
                  </div>
 
                  <div className="bg-red-500/5 p-6 rounded-3xl border border-red-500/10 hover:bg-red-500/10 transition-colors group">
                    <h3 className="font-bold text-red-400 uppercase tracking-widest text-[11px] mb-2 flex items-center gap-2">
                       <AlertTriangle size={14} /> Permanent Erasure
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed font-medium mb-5">
                      Permanently delete your account and all data. This is IRREVERSIBLE.
                    </p>
                    <button type="button"
                      onClick={handleDelete}
                      disabled={deleteAccountMutation.isPending}
                      className="w-full px-5 py-3 bg-red-500/10 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                    >
                      {deleteAccountMutation.isPending ? 'DELETING...' : 'DELETE ACCOUNT'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'close_friends' && (
             <CloseFriendsModal onClose={() => setActiveTab('profile')} /> 
            )}

            {activeTab === 'security' && (
              <div className="max-w-xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tighter">Security</h2>
                  <p className="text-gray-400 text-sm font-medium mt-1 uppercase tracking-widest italic opacity-60">Next-Gen Protection</p>
                </div>
                <div className="bg-white/2 p-6 rounded-3xl border border-white/5">
                   <PasskeySettings />
                </div>
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
