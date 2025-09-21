import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="min-h-screen diamond-background flex items-center justify-center">
      <div className="gradient-overlay min-h-screen w-full flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-xl p-8 text-center"
        >
          {/* Spinning Diamond */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 diamond-shape bg-gradient-to-br from-blue-400 to-purple-600 mx-auto mb-4"
          />
          
          {/* Message */}
          <p className="text-white font-poppins text-lg font-medium">
            {message}
          </p>
          
          {/* Loading dots animation */}
          <div className="flex justify-center space-x-1 mt-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
                className="w-2 h-2 bg-white rounded-full"
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingSpinner;