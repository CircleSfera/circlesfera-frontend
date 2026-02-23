import type {
  User as IUser,
  Profile as IProfile,
  Post as IPost,
  PostMedia as IPostMedia,
  Comment as IComment,
  Story as IStory,
  Collection as ICollection,
  Audio as IAudio,
  ProfileWithUser as IProfileWithUser,
  Message as IMessage,
  Participant as IParticipant,
  Conversation as IConversation,
  Notification as INotification,
  SearchResult as ISearchResult,
  Report as IReport,
  RegisterDto as IRegisterDto,
  LoginDto as ILoginDto,
  UpdateProfileDto as IUpdateProfileDto,
  CreateCommentDto as ICreateCommentDto,
  CreateStoryDto as ICreateStoryDto,
} from '@circlesfera/shared';

export type User = IUser;
export type Profile = IProfile;
export type Post = IPost;
export type PostMedia = IPostMedia;
export type Comment = IComment;
export type Story = IStory;
export type Collection = ICollection;
export type Audio = IAudio;
export type ProfileWithUser = IProfileWithUser;

export interface PostMediaItem {
  url: string;
  type?: string;
  filter?: string;
  altText?: string;
}
export type Participant = IParticipant;
export type Conversation = Omit<IConversation, 'messages'> & {
  messages: Message[];
};
export type Notification = INotification;
export type SearchResult = ISearchResult;
export type Report = IReport;

export type RegisterDto = IRegisterDto;
export type LoginDto = ILoginDto;
export type UpdateProfileDto = IUpdateProfileDto;
export type CreateCommentDto = ICreateCommentDto;
export type CreateStoryDto = ICreateStoryDto;

export type CreatePostDto = {
  caption?: string;
  type?: 'POST' | 'FRAME';
  location?: string;
  hideLikes?: boolean;
  turnOffComments?: boolean;
  media?: PostMediaItem[];
  audioId?: string;
};

export type Message = Omit<IMessage, 'sender' | 'replyTo' | 'createdAt' | 'updatedAt'> & {
  tempId?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  sender?: {
    id: string;
    profile: Profile;
  };
  reactions?: {
    id: string;
    emoji: string;
    userId: string;
  }[];
  replyTo?: (Omit<IMessage, 'sender'> & {
    sender?: {
      id: string;
      profile: Partial<Profile>;
    };
  }) | null;
  post?: Post;
};

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

export interface SearchHistoryItem {
  id: string;
  query: string;
  createdAt: string;
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

export * from './error';
