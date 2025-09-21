import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { professionalDiamondCoach } from '../services/diamondCoachService';

const Dashboard = ({ currentUser, onLogout }) => {
  const [coachingState, setCoachingState] = useState(null);
  const [coachingMessage, setCoachingMessage] = useState(null);

  useEffect(() => {
    loadCoachingState();
    setupCoachingListeners();
  }, []);

  const loadCoachingState = () => {
    const state = professionalDiamondCoach.getCurrentState();
    setCoachingState(state);
  };

  const setupCoachingListeners = () => {
    professionalDiamondCoach.addEventListener('coaching_triggered', (data) => {
      setCoachingMessage(data);
      setTimeout(() => setCoachingMessage(null), 5000);
    });
  };

  const triggerTestCoaching = async () => {
    // Test the coaching system
    await professionalDiamondCoach.triggerCoaching('skillsCompleted', {
      topSkill: 'Technical Architecture'
    });
  };

  const testContribution = () => {
    professionalDiamondCoach.recordContribution({
      type: 'feature_shipped',
      description: 'DiamondManager login system',
      impact: 'Team can now authenticate'
    });
  };

  return (
    <div className="min-h-screen p-4 font-poppins">
      {/* Header */}
      <header className="glass-card rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 diamond-shape bg-gradient-to-br from-blue-400 to-purple-600" />
            <div>
              <h1 className="text-2xl font-bold text-white">DiamondManager</h1>
              <p className="text-white/70">Welcome back, {currentUser?.firstName}!</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all font-medium"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Coaching Notification */}
      {coachingMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="glass-card rounded-xl p-4 mb-6 border border-yellow-400/30"
        >
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 diamond-shape bg-gradient-to-br from-yellow-400 to-yellow-600 flex-shrink-0" />
            <div>
              <p className="text-yellow-200 font-semibold text-sm">Diamond Coach</p>
              <p className="text-white">{coachingMessage.message}</p>
              {coachingMessage.diamondAward && (
                <p className="text-yellow-300 text-sm mt-1">
                  +{coachingMessage.diamondAward.amount} 💎 {coachingMessage.diamondAward.category} diamonds
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* User Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-6"
        >
          <h2 className="text-white text-lg font-semibold mb-4">Your Profile</h2>
          <div className="space-y-3">
            <div>
              <p className="text-white/70 text-sm">Name</p>
              <p className="text-white">{currentUser?.firstName} {currentUser?.lastName}</p>
            </div>
            <div>
              <p className="text-white/70 text-sm">Role</p>
              <p className="text-white">{currentUser?.role || 'Team Member'}</p>
            </div>
            <div>
              <p className="text-white/70 text-sm">Email</p>
              <p className="text-white">{currentUser?.email}</p>
            </div>
          </div>
        </motion.div>

        {/* Diamond Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-6"
        >
          <h2 className="text-white text-lg font-semibold mb-4">Diamonds Earned</h2>
          {coachingState && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-green-300">💎 Technical</span>
                <span className="text-white font-semibold">{coachingState.diamondsEarned?.GREEN || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-300">💎 Collaboration</span>
                <span className="text-white font-semibold">{coachingState.diamondsEarned?.BLUE || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-yellow-300">💎 Delivery</span>
                <span className="text-white font-semibold">{coachingState.diamondsEarned?.GOLD || 0}</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-xl p-6"
        >
          <h2 className="text-white text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button
              onClick={triggerTestCoaching}
              className="w-full py-2 px-4 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 rounded-lg transition-all text-sm"
            >
              Test Coaching
            </button>
            <button
              onClick={testContribution}
              className="w-full py-2 px-4 bg-green-500/20 hover:bg-green-500/30 text-green-200 rounded-lg transition-all text-sm"
            >
              Record Contribution
            </button>
            <button className="w-full py-2 px-4 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 rounded-lg transition-all text-sm">
              View Goals
            </button>
          </div>
        </motion.div>

        {/* Current State */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-xl p-6 md:col-span-2 lg:col-span-3"
        >
          <h2 className="text-white text-lg font-semibold mb-4">Development Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-white/70 text-sm">Current State</p>
              <p className="text-white font-semibold">{coachingState?.state || 'Loading...'}</p>
            </div>
            <div className="text-center">
              <p className="text-white/70 text-sm">Total Contributions</p>
              <p className="text-white font-semibold">{coachingState?.totalContributions || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-white/70 text-sm">App Context</p>
              <p className="text-white font-semibold">DiamondManager</p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Dashboard;