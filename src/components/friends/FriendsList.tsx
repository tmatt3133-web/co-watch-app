import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Friend } from '../../types';
import { Users, UserPlus, Send, Circle } from 'lucide-react';
import AddFriendModal from './AddFriendModal';

interface FriendsListProps {
  onSendVideo: (friendId: string) => void;
}

const FriendsList: React.FC<FriendsListProps> = ({ onSendVideo }) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/friends', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setFriends(data.friends || []);
    } catch (error) {
      console.error('Failed to fetch friends:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFriend = async (username: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/friends/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username }),
      });

      if (response.ok) {
        fetchFriends();
        setIsAddModalOpen(false);
      }
    } catch (error) {
      console.error('Failed to add friend:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Friends</h1>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAddModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <UserPlus size={20} />
          Add Friend
        </motion.button>
      </div>

      {friends.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
            No friends yet
          </h2>
          <p className="text-gray-500 dark:text-gray-500 mb-6">
            Add some friends to start watching videos together!
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary"
          >
            Add Your First Friend
          </motion.button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {friends.map((friend) => (
              <motion.div
                key={friend.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {friend.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {friend.username}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Circle
                          size={8}
                          className={`fill-current ${
                            friend.status === 'online'
                              ? 'text-green-500'
                              : 'text-gray-400'
                          }`}
                        />
                        <span
                          className={`text-sm ${
                            friend.status === 'online'
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-gray-500'
                          }`}
                        >
                          {friend.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSendVideo(friend.id)}
                  disabled={friend.status === 'offline'}
                  className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                  Send Video
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AddFriendModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddFriend={handleAddFriend}
      />
    </div>
  );
};

export default FriendsList;