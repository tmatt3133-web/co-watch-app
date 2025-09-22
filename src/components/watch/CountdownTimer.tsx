import React from 'react';
import { motion } from 'framer-motion';

interface CountdownTimerProps {
  count: number;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ count }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50"
    >
      <div className="text-center">
        <motion.div
          key={count}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-8xl font-bold text-white mb-4"
        >
          {count}
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl text-gray-300"
        >
          Starting in...
        </motion.p>
      </div>
    </motion.div>
  );
};

export default CountdownTimer;