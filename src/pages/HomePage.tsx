import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play, Users, Video, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState<string | null>(null);

  const features = [
    {
      id: 'sync',
      icon: Zap,
      title: 'Real-time Sync',
      description: 'Watch videos with friends in perfect sync, no delays',
      color: 'from-yellow-400 to-orange-500',
    },
    {
      id: 'friends',
      icon: Users,
      title: 'Friends & Groups',
      description: 'Add friends and create watch parties easily',
      color: 'from-blue-400 to-purple-500',
    },
    {
      id: 'reactions',
      icon: Video,
      title: 'Live Reactions',
      description: 'Share emotions with emoji reactions and chat',
      color: 'from-green-400 to-blue-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.h1
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6"
          >
            Welcome to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-600">
              CoWatch
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto"
          >
            Watch YouTube videos together with friends in perfect sync.
            Share reactions, chat, and enjoy content like you're in the same room.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/friends')}
              className="btn-primary flex items-center gap-2 px-8 py-3 text-lg"
            >
              <Users size={20} />
              Find Friends
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/videos')}
              className="btn-secondary flex items-center gap-2 px-8 py-3 text-lg"
            >
              <Play size={20} />
              Start Watching
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="grid md:grid-cols-3 gap-8 mb-16"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                onHoverStart={() => setIsHovered(feature.id)}
                onHoverEnd={() => setIsHovered(null)}
                className="relative group"
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={32} className="text-white" />
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {feature.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>

                  <motion.div
                    animate={{
                      opacity: isHovered === feature.id ? 1 : 0,
                      scale: isHovered === feature.id ? 1 : 0.8
                    }}
                    className={`absolute -inset-1 bg-gradient-to-r ${feature.color} rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300`}
                  />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="text-center"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Ready to get started?
            </h3>

            <div className="grid grid-cols-3 gap-8">
              <div>
                <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                  1ms
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Sync Delay
                </div>
              </div>

              <div>
                <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                  24/7
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Available
                </div>
              </div>

              <div>
                <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                  Free
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Always
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;