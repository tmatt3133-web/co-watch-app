import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../../hooks/useSocket';
import { VideoInfo, SyncData, ChatMessage, EmojiReaction } from '../../types';
import { Users, MessageCircle, RotateCcw, Play, Pause, Volume2 } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import EmojiOverlay from './EmojiOverlay';
import ChatPanel from './ChatPanel';
import { getYouTubeEmbedUrl } from '../../utils/youtube';

interface Participant {
  id: string;
  username: string;
}

const WatchRoom: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reactions, setReactions] = useState<EmojiReaction[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<any>(null);
  const lastSyncRef = useRef<number>(0);
  const syncThreshold = 2; // seconds

  const socketEvents = {
    onSyncReceived: useCallback((data: SyncData) => {
      const timeDiff = Math.abs(data.currentTime - currentTime);
      if (timeDiff > syncThreshold && Date.now() - lastSyncRef.current > 1000) {
        if (playerRef.current) {
          playerRef.current.seekTo(data.currentTime, true);
          if (data.isPlaying && !isPlaying) {
            playerRef.current.playVideo();
          } else if (!data.isPlaying && isPlaying) {
            playerRef.current.pauseVideo();
          }
        }
        lastSyncRef.current = Date.now();
      }
    }, [currentTime, isPlaying]),

    onChatMessage: useCallback((message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
    }, []),

    onEmojiReaction: useCallback((reaction: EmojiReaction) => {
      setReactions(prev => [...prev, reaction]);
      setTimeout(() => {
        setReactions(prev => prev.filter(r => r.id !== reaction.id));
      }, 3000);
    }, []),

    onUserJoined: useCallback((userId: string, username: string) => {
      setParticipants(prev => [...prev, { id: userId, username }]);
    }, []),

    onUserLeft: useCallback((userId: string) => {
      setParticipants(prev => prev.filter(p => p.id !== userId));
    }, []),

    onCountdownStart: useCallback((count: number) => {
      setCountdown(count);
    }, []),
  };

  const { socket, isConnected, joinWatchSession, sendSyncData, sendChatMessage, sendEmojiReaction, requestSync } = useSocket(socketEvents);

  useEffect(() => {
    if (!sessionId) {
      navigate('/');
      return;
    }

    if (isConnected) {
      joinWatchSession(sessionId);
    }
  }, [sessionId, isConnected, joinWatchSession, navigate]);

  useEffect(() => {
    if (socket) {
      socket.on('session-joined', (data: { videoInfo: VideoInfo; participants: Participant[]; syncData: SyncData }) => {
        setVideoInfo(data.videoInfo);
        setParticipants(data.participants);
        setCurrentTime(data.syncData.currentTime);
        setIsPlaying(data.syncData.isPlaying);
      });

      socket.on('countdown-end', () => {
        setCountdown(null);
        if (playerRef.current) {
          playerRef.current.seekTo(0, true);
          playerRef.current.playVideo();
        }
      });

      return () => {
        socket.off('session-joined');
        socket.off('countdown-end');
      };
    }
  }, [socket]);

  useEffect(() => {
    if (videoInfo && window.YT) {
      const player = new window.YT.Player('youtube-player', {
        videoId: videoInfo.id,
        events: {
          onReady: () => {
            setIsVideoReady(true);
            playerRef.current = player;
          },
          onStateChange: (event: any) => {
            const playerState = event.data;
            const newIsPlaying = playerState === window.YT.PlayerState.PLAYING;
            const newCurrentTime = player.getCurrentTime();

            setIsPlaying(newIsPlaying);
            setCurrentTime(newCurrentTime);

            if (Date.now() - lastSyncRef.current > 1000) {
              sendSyncData({
                currentTime: newCurrentTime,
                isPlaying: newIsPlaying,
                timestamp: Date.now(),
              });
              lastSyncRef.current = Date.now();
            }
          },
        },
      });
    }
  }, [videoInfo, sendSyncData]);

  const handleStartCountdown = () => {
    if (socket) {
      socket.emit('start-countdown', sessionId);
    }
  };

  const handleManualSync = () => {
    requestSync();
  };

  const handleEmojiClick = (emoji: string, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    sendEmojiReaction(emoji, x, y);
  };

  if (!videoInfo) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-white">Loading watch room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* YouTube API Script */}
      <script src="https://www.youtube.com/iframe_api" async></script>

      <div className="relative">
        {/* Video Container */}
        <div className="relative aspect-video bg-black">
          <div id="youtube-player" className="w-full h-full"></div>

          {/* Countdown Overlay */}
          <AnimatePresence>
            {countdown !== null && countdown > 0 && (
              <CountdownTimer count={countdown} />
            )}
          </AnimatePresence>

          {/* Emoji Reactions Overlay */}
          <EmojiOverlay reactions={reactions} />

          {/* Controls Overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-black bg-opacity-60 px-3 py-2 rounded-lg">
                <Users size={16} />
                <span className="text-sm">{participants.length}</span>
              </div>

              <button
                onClick={handleManualSync}
                className="bg-black bg-opacity-60 hover:bg-opacity-80 p-2 rounded-lg transition-colors"
                title="Manual Sync"
              >
                <RotateCcw size={16} />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                {['😂', '😍', '🔥', '👏', '😢'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={(e) => handleEmojiClick(emoji, e)}
                    className="bg-black bg-opacity-60 hover:bg-opacity-80 p-2 rounded-lg transition-colors text-lg"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="bg-black bg-opacity-60 hover:bg-opacity-80 p-2 rounded-lg transition-colors"
              >
                <MessageCircle size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Video Info */}
        <div className="bg-gray-800 p-6">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">{videoInfo.title}</h1>
              <div className="flex items-center gap-4 text-gray-400">
                <div className="flex items-center gap-2">
                  <Users size={16} />
                  <span>{participants.length} watching</span>
                </div>
              </div>
            </div>

            {isVideoReady && (
              <button
                onClick={handleStartCountdown}
                className="btn-primary"
              >
                Start Together
              </button>
            )}
          </div>
        </div>

        {/* Participants List */}
        <div className="bg-gray-800 border-t border-gray-700 p-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold mb-3">Watching Now</h3>
            <div className="flex flex-wrap gap-3">
              {participants.map((participant) => (
                <motion.div
                  key={participant.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-2 bg-gray-700 px-3 py-2 rounded-lg"
                >
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {participant.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm">{participant.username}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Panel */}
        <AnimatePresence>
          {isChatOpen && (
            <ChatPanel
              messages={messages}
              onSendMessage={sendChatMessage}
              onClose={() => setIsChatOpen(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WatchRoom;