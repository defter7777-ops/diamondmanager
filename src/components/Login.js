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
          {/* Enhanced Header with Better Logo Contrast */}
          <div className="text-center mb-8">
            {/* Logo with Multiple Contrast Enhancements */}
            <div className="relative mx-auto w-20 h-20 mb-6">
              <div className="absolute inset-0 bg-white/15 rounded-2xl blur-md"></div>
              <img 
                src="/diamond_manager_logo.png" 
                alt="DiamondManager" 
                className="relative w-20 h-20 rounded-2xl bg-white/10 p-2 ring-2 ring-white/30 shadow-2xl backdrop-blur-sm mx-auto hover:ring-white/50 transition-all duration-300"
              />
            </div>
            <h1 className="text-2xl font-bold text-white font-poppins leading-tight tracking-tight">DiamondManager</h1>
            <p className="text-slate-200 font-poppins mt-3 text-base leading-relaxed">Diamond Makers Team Platform</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-white font-poppins font-semibold mb-3 text-sm">
                Sähköposti
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={credentials.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-4 rounded-xl bg-white/10 border border-white/25 text-white placeholder-slate-300 font-poppins focus:outline-none focus:border-blue-400 focus:bg-white/15 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 text-base"
                placeholder="your@diamondmakers.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-white font-poppins font-semibold mb-3 text-sm">
                Salasana
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-4 rounded-xl bg-white/10 border border-white/25 text-white placeholder-slate-300 font-poppins focus:outline-none focus:border-blue-400 focus:bg-white/15 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 text-base"
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
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-poppins font-bold rounded-xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-400/30 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-xl hover:shadow-2xl active:scale-[0.98] text-base"
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

          {/* Enhanced Team Members Info */}
          <div className="mt-8 pt-6 border-t border-white/25">
            <p className="text-slate-300 text-sm text-center font-poppins font-medium">
              Diamond Makers Team Platform
            </p>
            <p className="text-slate-400 text-sm text-center font-poppins mt-2 tracking-wide">
              Tommi • Janne • Mikko • Juhani
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;