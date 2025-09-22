import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { SyncData, ChatMessage, EmojiReaction } from '../types';

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  joinWatchSession: (sessionId: string) => void;
  leaveWatchSession: () => void;
  sendSyncData: (data: SyncData) => void;
  sendChatMessage: (message: string) => void;
  sendEmojiReaction: (emoji: string, x: number, y: number) => void;
  requestSync: () => void;
}

interface SocketEvents {
  onSyncReceived?: (data: SyncData) => void;
  onChatMessage?: (message: ChatMessage) => void;
  onEmojiReaction?: (reaction: EmojiReaction) => void;
  onUserJoined?: (userId: string, username: string) => void;
  onUserLeft?: (userId: string) => void;
  onCountdownStart?: (countdown: number) => void;
  onVideoInvite?: (sessionId: string, videoInfo: any, fromUser: string) => void;
}

export const useSocket = (events: SocketEvents = {}): UseSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const currentSessionRef = useRef<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const newSocket = io('/', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    newSocket.on('sync-data', (data: SyncData) => {
      events.onSyncReceived?.(data);
    });

    newSocket.on('chat-message', (message: ChatMessage) => {
      events.onChatMessage?.(message);
    });

    newSocket.on('emoji-reaction', (reaction: EmojiReaction) => {
      events.onEmojiReaction?.(reaction);
    });

    newSocket.on('user-joined', (userId: string, username: string) => {
      events.onUserJoined?.(userId, username);
    });

    newSocket.on('user-left', (userId: string) => {
      events.onUserLeft?.(userId);
    });

    newSocket.on('countdown-start', (countdown: number) => {
      events.onCountdownStart?.(countdown);
    });

    newSocket.on('video-invite', (sessionId: string, videoInfo: any, fromUser: string) => {
      events.onVideoInvite?.(sessionId, videoInfo, fromUser);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const joinWatchSession = (sessionId: string) => {
    if (socket && isConnected) {
      socket.emit('join-session', sessionId);
      currentSessionRef.current = sessionId;
    }
  };

  const leaveWatchSession = () => {
    if (socket && isConnected && currentSessionRef.current) {
      socket.emit('leave-session', currentSessionRef.current);
      currentSessionRef.current = null;
    }
  };

  const sendSyncData = (data: SyncData) => {
    if (socket && isConnected && currentSessionRef.current) {
      socket.emit('sync-data', {
        sessionId: currentSessionRef.current,
        ...data,
      });
    }
  };

  const sendChatMessage = (message: string) => {
    if (socket && isConnected && currentSessionRef.current) {
      socket.emit('chat-message', {
        sessionId: currentSessionRef.current,
        message,
      });
    }
  };

  const sendEmojiReaction = (emoji: string, x: number, y: number) => {
    if (socket && isConnected && currentSessionRef.current) {
      socket.emit('emoji-reaction', {
        sessionId: currentSessionRef.current,
        emoji,
        x,
        y,
      });
    }
  };

  const requestSync = () => {
    if (socket && isConnected && currentSessionRef.current) {
      socket.emit('request-sync', currentSessionRef.current);
    }
  };

  return {
    socket,
    isConnected,
    joinWatchSession,
    leaveWatchSession,
    sendSyncData,
    sendChatMessage,
    sendEmojiReaction,
    requestSync,
  };
};