import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Mail, Lock, Chrome } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted', { email, password, isSignUp });
  };

  return (
    <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Back to Home Link */}
        <div className="text-center mb-8">
          <Link 
            to="/"
            className="inline-flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
          >
            <Brain className="h-5 w-5" />
            <span className="font-orbitron font-bold">Tela.ai</span>
          </Link>
        </div>

        {/* Main Card */}
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur-sm border border-white/30 rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="w-16 h-16 bg-gradient-to-br from-white to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4"
            >
              <Brain className="h-8 w-8 text-black" />
            </motion.div>
            
            <h2 className="text-2xl font-orbitron font-bold text-white mb-2">
              {isSignUp ? 'Neural Interface Access' : 'Access Neural Interface'}
            </h2>
            <p className="text-gray-400">
              {isSignUp ? 'Initialize your AI command center' : 'Connect to your AI command center'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-800/60 border border-gray-600 text-white rounded-lg px-10 py-3 focus:outline-none focus:border-white transition-colors"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Security Key
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-800/60 border border-gray-600 text-white rounded-lg px-10 py-3 focus:outline-none focus:border-white transition-colors"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </motion.div>

            {/* Confirm Password Field (Sign Up Only) */}
            {isSignUp && (
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Confirm Security Key
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-gray-800/60 border border-gray-600 text-white rounded-lg px-10 py-3 focus:outline-none focus:border-white transition-colors"
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              type="submit"
              className="w-full bg-white hover:bg-gray-200 text-black py-3 rounded-lg font-semibold transition-colors"
            >
              {isSignUp ? 'Initialize Interface' : 'Connect to Interface'}
            </motion.button>

            {/* Google Sign In */}
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              type="button"
              className="w-full bg-gray-800/60 hover:bg-gray-700/60 border border-gray-600 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Chrome className="h-5 w-5" />
              Quick Connect
            </motion.button>
          </form>

          {/* Toggle Sign In/Up */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="text-center mt-6"
          >
            <p className="text-gray-400">
              {isSignUp ? 'Already have access?' : 'Need neural interface access?'}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-white hover:text-gray-300 font-medium ml-1 transition-colors"
              >
                {isSignUp ? 'Connect' : 'Initialize'}
              </button>
            </p>
          </motion.div>

          {/* Footer Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="text-center mt-8 pt-6 border-t border-gray-700"
          >
            <p className="text-sm text-gray-500">
              Engineered for the future by Tela.ai
            </p>
          </motion.div>
        </div>

        {/* Quick Access */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="text-center mt-6"
        >
          <Link
            to="/app"
            className="text-sm text-white hover:text-gray-300 transition-colors"
          >
            Experience demo interface →
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
