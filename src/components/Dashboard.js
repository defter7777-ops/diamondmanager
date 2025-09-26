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
    try {
      console.log('🔄 Loading coaching state...');
      const state = professionalDiamondCoach.getCurrentState();
      console.log('📊 Current state:', state);
      setCoachingState(state);
      console.log('✅ Coaching state set successfully');
    } catch (error) {
      console.error('❌ Error loading coaching state:', error);
    }
  };

  const setupCoachingListeners = () => {
    professionalDiamondCoach.addEventListener('coaching_triggered', (data) => {
      setCoachingMessage(data);
      setTimeout(() => setCoachingMessage(null), 5000);
    });
  };

  const triggerTestCoaching = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🔍 TESTAA VALMENNUS CLICKED - Starting...');
    
    try {
      // Test the coaching system
      console.log('📞 Calling professionalDiamondCoach.triggerCoaching...');
      const result = await professionalDiamondCoach.triggerCoaching('skillsCompleted', {
        topSkill: 'Tekninen Arkkitehtuuri'
      });
      
      console.log('✅ Coaching result:', result);
      
      // Refresh coaching state
      console.log('🔄 Refreshing coaching state...');
      loadCoachingState();
      
      console.log('✅ TESTAA VALMENNUS COMPLETED');
      
    } catch (error) {
      console.error('❌ Coaching test error:', error);
      console.error('Error stack:', error.stack);
    }
  };

  const testContribution = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      professionalDiamondCoach.recordContribution({
        type: 'feature_shipped',
        description: 'DiamondManager kirjautumisjärjestelmä',
        impact: 'Tiimi voi nyt kirjautua sisään'
      });
      
      // Refresh coaching state
      loadCoachingState();
    } catch (error) {
      console.error('Contribution test error:', error);
    }
  };

  return (
    <div className="min-h-screen p-4 font-poppins">
      {/* Header */}
      <header className="glass-card rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src="/diamond_manager_logo.png" 
              alt="DiamondManager" 
              className="w-8 h-8 rounded"
            />
            <div>
              <h1 className="text-lg font-semibold text-white">DiamondManager</h1>
              <p className="text-white/70 text-sm">Tervetuloa takaisin, {currentUser?.firstName}!</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all font-medium"
          >
            Kirjaudu ulos
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
            <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-yellow-400 text-lg">🤖</span>
            </div>
            <div>
              <p className="text-yellow-200 font-semibold text-sm">Timantti Valmentaja</p>
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
          <h2 className="text-white text-lg font-semibold mb-4">Profiilisi</h2>
          <div className="space-y-3">
            <div>
              <p className="text-white/70 text-sm">Nimi</p>
              <p className="text-white">{currentUser?.firstName} {currentUser?.lastName}</p>
            </div>
            <div>
              <p className="text-white/70 text-sm">Rooli</p>
              <p className="text-white">{currentUser?.role || 'Tiimin jäsen'}</p>
            </div>
            <div>
              <p className="text-white/70 text-sm">Sähköposti</p>
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
          <h2 className="text-white text-lg font-semibold mb-4">Ansaitut Timantit</h2>
          {coachingState && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-green-300">💎 Tekninen</span>
                <span className="text-white font-semibold">{coachingState.diamondsEarned?.GREEN || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-300">💎 Yhteistyö</span>
                <span className="text-white font-semibold">{coachingState.diamondsEarned?.BLUE || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-yellow-300">💎 Toimitus</span>
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
          <h2 className="text-white text-lg font-semibold mb-4">Pikatoiminnot</h2>
          <div className="space-y-3">
            <button
              onClick={triggerTestCoaching}
              className="w-full py-2 px-4 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 rounded-lg transition-all text-sm"
            >
              Testaa Valmennus
            </button>
            <button
              onClick={testContribution}
              className="w-full py-2 px-4 bg-green-500/20 hover:bg-green-500/30 text-green-200 rounded-lg transition-all text-sm"
            >
              Tallenna Saavutus
            </button>
            <button className="w-full py-2 px-4 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 rounded-lg transition-all text-sm">
              Näytä Tavoitteet
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
          <h2 className="text-white text-lg font-semibold mb-4">Kehityksen Tila</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-white/70 text-sm">Nykyinen Tila</p>
              <p className="text-white font-semibold">{coachingState?.state || 'Ladataan...'}</p>
            </div>
            <div className="text-center">
              <p className="text-white/70 text-sm">Kokonaissuoritukset</p>
              <p className="text-white font-semibold">{coachingState?.totalContributions || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-white/70 text-sm">Sovelluskonteksti</p>
              <p className="text-white font-semibold">DiamondManager</p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Dashboard;