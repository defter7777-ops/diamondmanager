import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';

// Components
import LoadingSpinner from './components/LoadingSpinner';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

// Services
import { authService } from './services/authService';
import { professionalDiamondCoach } from './services/diamondCoachService';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const initializeApp = useCallback(async () => {
    try {
      const authStatus = await authService.checkAuthStatus();
      
      if (authStatus.isAuthenticated) {
        setIsAuthenticated(true);
        setCurrentUser(authStatus.user);
        
        // Initialize DiamondCoach for authenticated user
        await initializeDiamondCoach(authStatus.user);
      }
    } catch (error) {
      console.error('App initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  const initializeDiamondCoach = async (user) => {
    try {
      const memberProfile = {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
        identifiedStrength: user.metadata?.superpower || null
      };

      await professionalDiamondCoach.initialize(memberProfile);
    } catch (error) {
      console.error('DiamondCoach initialization error:', error);
    }
  };

  const handleLogin = async (credentials) => {
    try {
      setIsLoading(true);
      const result = await authService.login(credentials);
      
      if (result.success) {
        setIsAuthenticated(true);
        setCurrentUser(result.user);
        await initializeDiamondCoach(result.user);
      } else {
        throw new Error(result.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
      setCurrentUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Initializing DiamondManager..." />;
  }

  return (
    <div className="min-h-screen diamond-background">
      <div className="min-h-screen gradient-overlay">
        <AnimatePresence mode="wait">
          {!isAuthenticated ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Login onLogin={handleLogin} />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Dashboard 
                currentUser={currentUser} 
                onLogout={handleLogout} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;