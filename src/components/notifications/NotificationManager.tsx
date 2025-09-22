import React, { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useSocket } from '../../hooks/useSocket';
import { VideoInfo } from '../../types';

const NotificationManager: React.FC = () => {
  const socketEvents = {
    onVideoInvite: (sessionId: string, videoInfo: VideoInfo, fromUser: string) => {
      toast((t) => (
        <div className="flex items-center gap-3">
          <img
            src={videoInfo.thumbnail}
            alt={videoInfo.title}
            className="w-12 h-8 object-cover rounded"
          />
          <div className="flex-1">
            <p className="font-medium">{fromUser} invited you to watch:</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {videoInfo.title}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                window.location.href = `/watch/${sessionId}`;
                toast.dismiss(t.id);
              }}
              className="bg-primary-600 text-white px-3 py-1 rounded text-sm hover:bg-primary-700"
            >
              Join
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
            >
              Dismiss
            </button>
          </div>
        </div>
      ), {
        duration: 10000,
        style: {
          maxWidth: '400px',
          padding: '16px',
        },
      });
    },

    onUserJoined: (userId: string, username: string) => {
      toast.success(`${username} joined the watch party`, {
        duration: 3000,
        icon: '👋',
      });
    },

    onUserLeft: (userId: string) => {
      // You might want to store usernames in a ref or context to show proper names
      toast(`Someone left the watch party`, {
        duration: 3000,
        icon: '👋',
        style: {
          background: '#FEF3C7',
          color: '#92400E',
        },
      });
    },
  };

  useSocket(socketEvents);

  return null; // This component only handles notifications
};

export default NotificationManager;