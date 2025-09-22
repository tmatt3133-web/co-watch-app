import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EmojiReaction } from '../../types';

interface EmojiOverlayProps {
  reactions: EmojiReaction[];
}

const EmojiOverlay: React.FC<EmojiOverlayProps> = ({ reactions }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {reactions.map((reaction) => (
          <motion.div
            key={reaction.id}
            initial={{ scale: 0, opacity: 1 }}
            animate={{
              scale: [0, 1.2, 1],
              y: [0, -20, -40],
              opacity: [1, 1, 0]
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3, ease: "easeOut" }}
            className="absolute text-4xl"
            style={{
              left: `${reaction.x}%`,
              top: `${reaction.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {reaction.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default EmojiOverlay;