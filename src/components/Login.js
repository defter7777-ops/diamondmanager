import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await onLogin(credentials);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="glass-card rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <img 
              src="/diamond_manager_logo.png" 
              alt="DiamondManager" 
              className="w-12 h-12 rounded mx-auto mb-4"
            />
            <h1 className="text-xl font-semibold text-white font-poppins">DiamondManager</h1>
            <p className="text-white/80 font-poppins mt-2 text-sm">Diamond Makers Team Platform</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-white font-poppins font-medium mb-2">
                Sähköposti
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={credentials.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 font-poppins focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all"
                placeholder="your@diamondmakers.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-white font-poppins font-medium mb-2">
                Salasana
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 font-poppins focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200 text-sm font-poppins"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-poppins font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  <span>Kirjaudutaan...</span>
                </div>
              ) : (
                'Kirjaudu sisään'
              )}
            </button>
          </form>

          {/* Team Members Info */}
          <div className="mt-8 pt-6 border-t border-white/20">
            <p className="text-white/60 text-sm text-center font-poppins">
              Diamond Makers Team Platform
            </p>
            <p className="text-white/40 text-xs text-center font-poppins mt-1">
              Tommi • Janne • Mikko • Juhani
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;