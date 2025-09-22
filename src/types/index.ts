export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface Friend {
  id: string;
  username: string;
  status: 'online' | 'offline';
}

export interface VideoInfo {
  id: string;
  title: string;
  thumbnail: string;
  duration: number;
  url: string;
}

export interface WatchSession {
  id: string;
  videoInfo: VideoInfo;
  participants: User[];
  createdBy: string;
  createdAt: string;
  isActive: boolean;
}

export interface SyncData {
  currentTime: number;
  isPlaying: boolean;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: number;
}

export interface EmojiReaction {
  id: string;
  userId: string;
  emoji: string;
  timestamp: number;
  x: number;
  y: number;
}