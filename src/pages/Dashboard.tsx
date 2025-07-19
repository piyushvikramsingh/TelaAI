import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  CheckSquare, 
  Palette, 
  Brain, 
  FileText, 
  Settings,
  Send,
  Mic,
  Paperclip,
  Sparkles,
  Code,
  BookOpen
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const sidebarItems = [
    { id: 'chat', icon: MessageCircle, label: 'Neural Chat' },
    { id: 'tasks', icon: CheckSquare, label: 'Task Engine' },
    { id: 'design', icon: Palette, label: 'Design Lab' },
    { id: 'memory', icon: Brain, label: 'Memory Core' },
    { id: 'files', icon: FileText, label: 'Data Vault' },
    { id: 'settings', icon: Settings, label: 'System Config' }
  ];

  const suggestions = [
    { text: 'Generate Brand Identity', icon: Sparkles },
    { text: 'Optimize Code Performance', icon: Code },
    { text: 'Analyze Data Patterns', icon: BookOpen }
  ];

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    setIsTyping(true);
    // Simulate AI response delay
    setTimeout(() => {
      setIsTyping(false);
    }, 2000);
    
    setMessage('');
  };

  return (
    <div className="relative z-10 min-h-screen flex">
      {/* Sidebar */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-64 bg-gray-900/80 backdrop-blur-sm border-r border-white/20 flex flex-col"
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-orbitron font-bold text-white">
            Tela.ai
          </h1>
          <p className="text-xs text-gray-400 mt-1">Neural Interface v2.0</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg mb-2 transition-all ${
                activeTab === item.id
                  ? 'bg-white/20 text-white border border-white/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* AI Status */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-white to-gray-300 flex items-center justify-center ${isTyping ? 'animate-pulse-slow' : ''}`}>
              <Brain className="h-5 w-5 text-black" />
            </div>
            <div>
              <p className="text-white font-medium">Neural Core</p>
              <p className="text-xs text-gray-400">
                {isTyping ? 'Processing...' : 'Online'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-900/60 backdrop-blur-sm border-b border-white/20 p-4"
        >
          <h2 className="text-xl font-semibold text-white capitalize">
            {activeTab === 'chat' ? 'Neural Chat Interface' : 
             activeTab === 'tasks' ? 'Task Execution Engine' :
             activeTab === 'design' ? 'Design Laboratory' :
             activeTab === 'memory' ? 'Memory Core Access' :
             activeTab === 'files' ? 'Data Vault' : 'System Configuration'}
          </h2>
        </div>

        {/* Chat Content */}
        <div className="flex-1 flex flex-col">
          {/* Messages Area */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex-1 p-6 overflow-y-auto"
          >
            <div className="max-w-4xl mx-auto space-y-4">
              {/* Welcome Message */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white to-gray-300 flex items-center justify-center flex-shrink-0">
                  <Brain className="h-4 w-4 text-black" />
                </div>
                <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/30 border border-white/20 rounded-2xl rounded-tl-sm p-4 max-w-md shadow-lg shadow-white/10">
                  <p className="text-white">
                    Neural interface initialized. Ready to accelerate your workflow with advanced AI capabilities.
                  </p>
                </div>
              </div>

              {isTyping && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white to-gray-300 flex items-center justify-center flex-shrink-0 animate-pulse-slow">
                    <Brain className="h-4 w-4 text-black" />
                  </div>
                  <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/30 border border-white/20 rounded-2xl rounded-tl-sm p-4 max-w-md">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Suggestion Chips */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="px-6 pb-4"
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-wrap gap-2 mb-4">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setMessage(suggestion.text)}
                    className="bg-gray-800/60 hover:bg-white/20 border border-gray-700 hover:border-white/30 text-gray-300 hover:text-white px-4 py-2 rounded-full text-sm transition-all flex items-center gap-2"
                  >
                    <suggestion.icon className="h-4 w-4" />
                    {suggestion.text}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Input Area */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-gray-900/60 backdrop-blur-sm border-t border-white/20 p-6"
          >
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-2xl p-4 flex items-end gap-4">
                <div className="flex-1">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Engage neural interface..."
                    className="w-full bg-transparent text-white placeholder-gray-400 resize-none outline-none"
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-white transition-colors">
                    <Paperclip className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-white transition-colors">
                    <Mic className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="p-2 bg-white hover:bg-gray-200 disabled:bg-gray-700 text-black rounded-lg transition-colors disabled:cursor-not-allowed"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
