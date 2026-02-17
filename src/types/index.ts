export interface User {
  id: string;
  email: string;
  createdAt: string;
  isOnline?: boolean;
  lastSeenAt?: string | null;
}

export interface Profile {
  id: string;
  userId: string;
  username: string;
  fullName: string | null;
  bio: string | null;
  avatar: string | null;
  website: string | null;
  location?: string | null;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileWithUser extends Profile {
  user?: {
    id: string;
    email: string;
    createdAt: string;
    _count?: {
      posts: number;
      followers: number;
      following: number;
    };
  };
}

export interface PostMedia {
  id: string;
  url: string;
  type: string; // 'image' | 'video'
  filter?: string;
  order: number;
}

export interface Post {
  id: string;
  userId: string;
  caption: string | null;
  // Deprecated/Legacy
  mediaUrl?: string;
  mediaType?: string;
  // New
  media: PostMedia[];
  type?: string; // 'POST' | 'FRAME'
  audioId?: string;
  audio?: Audio;
  
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    profile: Profile;
    role?: string;
  };
  _count: {
    likes: number;
    comments: number;
  };
  isLiked?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  mediaUrl?: string; // Phase 8: Rich Messaging
  mediaType?: string; // Phase 8: Rich Messaging
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    profile: Profile;
  };
  parentId?: string | null;
  replies?: Comment[];
}

export interface Collection {
  id: string;
  userId: string;
  name: string;
  coverUrl?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    bookmarks: number;
  };
}

export interface Story {
  id: string;
  userId: string;
  mediaUrl: string;
  mediaType: string;
  filter?: string;
  expiresAt: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    profile: Profile;
  };
  isCloseFriendsOnly?: boolean;
  audioId?: string;
  audio?: Audio;
}

export interface UserWithProfile {
    id: string;
    email: string;
    profile: Profile;
}

export interface SuggestedUser {
  id: string;
  username: string;
  fullName: string | null;
  avatar: string | null;
  bio: string | null;
  followersCount: number;
  reason: string;
}

export interface Notification {
  id: string;
  recipientId: string;
  senderId: string | null;
  type: string;
  content: string;
  read: boolean;
  createdAt: string;
  postId?: string;
  commentId?: string;
  sender: {
    id: string;
    email: string;
    profile: Profile;
  } | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  verified?: boolean;
  userId?: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  username: string;
  fullName?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface UpdateProfileDto {
  fullName?: string;
  bio?: string;
  avatar?: string;
  website?: string;
  isPrivate?: boolean;
}

export interface CreatePostDto {
  type?: string; // 'POST' | 'FRAME'
  caption?: string;
  audioId?: string;
  // Legacy
  mediaUrl?: string;
  mediaType?: string;
  location?: string;
  hideLikes?: boolean;
  turnOffComments?: boolean;
  // New
  media?: Array<{
    url: string;
    type: string;
    filter?: string;
    altText?: string;
  }>;
}

export interface CreateCommentDto {
  content: string;
  parentId?: string;
  mediaUrl?: string;
  mediaType?: string;
}

export interface CreateStoryDto {
  mediaUrl: string;
  mediaType?: string;
  isCloseFriendsOnly?: boolean;
  audioId?: string;
}

// Chat Interfaces
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  mediaUrl?: string; // Phase 8
  mediaType?: string; // Phase 8
  postId?: string; // Phase 8
  post?: Post; // Phase 8
  replyToId?: string | null;
  replyTo?: {
    id: string;
    content: string;
    mediaUrl?: string;
    sender: {
        profile: {
            username: string;
        }
    }
  };
  reactions?: {
    id: string;
    emoji: string;
    userId: string;
  }[];
  createdAt: string;
  tempId?: string;
  sender: {
    id: string;
    profile: {
      username: string;
      avatar: string | null;
    };
  };
}

export interface Participant {
  id: string;
  userId: string;
  lastReadAt?: string; // Phase 8
  user: {
    id: string;
    isOnline?: boolean;
    lastSeenAt?: string | null;
    profile: {
      username: string;
      fullName: string | null;
      avatar: string | null;
    };
  };
}

export interface Conversation {
  id: string;
  updatedAt: string;
  isGroup: boolean;
  name?: string | null;
  participants: Participant[];
  messages: Message[];
}

export interface HighlightStory {
  id: string;
  highlightId: string;
  storyId: string;
  createdAt: string;
  story: Story;
}

export interface Highlight {
  id: string;
  userId: string;
  title: string;
  coverUrl: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    profile: Profile;
  };
  stories?: HighlightStory[];
}

export interface Audio {
  id: string;
  title: string;
  artist: string;
  url: string;
  thumbnailUrl?: string;
  duration: number;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  createdAt: string;
}

export interface SearchResult {
  users: Array<{
    id: string;
    profile: Profile;
  }>;
  hashtags: Array<{
    id: string;
    tag: string;
    postCount: number;
  }>;
  semanticResults?: Post[];
}

export interface Report {
  id: string;
  reporterId: string;
  targetType: 'user' | 'post';
  targetId: string;
  reason: string;
  details?: string | null;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
  updatedAt: string;
  reporter?: {
    id: string;
    email: string;
    profile: Profile;
  };
}

export * from './error';
