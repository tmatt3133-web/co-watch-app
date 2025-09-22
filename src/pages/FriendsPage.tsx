import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import FriendsList from '../components/friends/FriendsList';
import VideoSendModal from '../components/video/VideoSendModal';
import { VideoInfo, Friend } from '../types';
import { useSocket } from '../hooks/useSocket';

const FriendsPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const socketEvents = {
    onVideoInvite: (sessionId: string, videoInfo: VideoInfo, fromUser: string) => {
      toast.success(`${fromUser} invited you to watch: ${videoInfo.title}`, {
        duration: 5000,
        onClick: () => {
          navigate(`/watch/${sessionId}`);
        },
      });
    },
  };

  const { socket } = useSocket(socketEvents);

  const handleSendVideo = (friendId: string) => {
    const friends = []; // This would come from your friends list state
    const friend = friends.find(f => f.id === friendId);
    if (friend) {
      setSelectedFriend(friend);
      setIsVideoModalOpen(true);
    }
  };

  const handleVideoSend = async (friendId: string, videoInfo: VideoInfo) => {
    try {
      if (socket) {
        socket.emit('send-video-invite', { friendId, videoInfo });

        socket.once('video-invite-sent', (sessionId: string) => {
          toast.success('Video invitation sent!');
          navigate(`/watch/${sessionId}`);
        });
      }
    } catch (error) {
      toast.error('Failed to send video invitation');
      throw error;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 dark:bg-gray-900"
    >
      <FriendsList onSendVideo={handleSendVideo} />

      <VideoSendModal
        isOpen={isVideoModalOpen}
        onClose={() => {
          setIsVideoModalOpen(false);
          setSelectedFriend(null);
        }}
        friend={selectedFriend}
        onSendVideo={handleVideoSend}
      />
    </motion.div>
  );
};

export default FriendsPage;