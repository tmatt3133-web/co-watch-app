import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Youtube, Clock, User } from 'lucide-react';
import { VideoInfo, Friend } from '../../types';
import { extractVideoId, getVideoInfo, formatDuration } from '../../utils/youtube';

interface VideoSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  friend: Friend | null;
  onSendVideo: (friendId: string, videoInfo: VideoInfo) => Promise<void>;
}

const VideoSendModal: React.FC<VideoSendModalProps> = ({
  isOpen,
  onClose,
  friend,
  onSendVideo,
}) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  const handleUrlChange = async (url: string) => {
    setVideoUrl(url);
    setVideoInfo(null);
    setError('');

    if (!url.trim()) return;

    const videoId = extractVideoId(url);
    if (!videoId) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    setIsLoading(true);
    try {
      const info = await getVideoInfo(videoId);
      if (info) {
        setVideoInfo(info);
      } else {
        setError('Could not fetch video information');
      }
    } catch (error) {
      setError('Failed to fetch video information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!friend || !videoInfo) return;

    setIsSending(true);
    try {
      await onSendVideo(friend.id, videoInfo);
      handleClose();
    } catch (error) {
      setError('Failed to send video');
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setVideoUrl('');
    setVideoInfo(null);
    setError('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && friend && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Send className="h-6 w-6 text-primary-600" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Send Video
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <User size={16} />
                    <span>to {friend.username}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  YouTube URL
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    className="input-field pl-10"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  <Youtube className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {error && (
                  <p className="text-red-500 text-sm mt-2">{error}</p>
                )}
              </div>

              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              )}

              {videoInfo && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4"
                >
                  <div className="flex gap-4">
                    <img
                      src={videoInfo.thumbnail}
                      alt={videoInfo.title}
                      className="w-32 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {videoInfo.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock size={16} />
                        <span>{formatDuration(videoInfo.duration)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSend}
                  disabled={!videoInfo || isSending}
                  className="flex-1 btn-primary"
                >
                  {isSending ? 'Sending...' : 'Send Video'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleClose}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VideoSendModal;