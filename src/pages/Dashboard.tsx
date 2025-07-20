import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { getChatCompletion, ApiMessage } from '../services/openai';
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
  BookOpen,
  User,
  AlertTriangle
} from 'lucide-react';

interface ChatMessage {
  role: 'assistant' | 'user' | 'error';
  content: string;
}

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Neural interface initialized. Ready to accelerate your workflow with advanced AI capabilities.'
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (messageContent?: string) => {
    const messageToSend = (messageContent || inputMessage).trim();
    if (!messageToSend) return;

    setInputMessage('');
    const newUserMessage: ChatMessage = { role: 'user', content: messageToSend };
    setMessages(prev => [...prev, newUserMessage]);
    setIsTyping(true);

    const apiMessages: ApiMessage[] = [
      ...messages.filter(m => m.role !== 'error').map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: messageToSend }
    ];

    try {
      const aiResponse = await getChatCompletion(apiMessages);
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      setMessages(prev => [...prev, { role: 'error', content: errorMessage }]);
    } finally {
      setIsTyping(false);
    }
  };

  const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isUser = message.role === 'user';
    const isAssistant = message.role === 'assistant';
    const isError = message.role === 'error';

    const bubbleStyles = {
      user: 'bg-white/10 border-white/20 self-end rounded-br-sm',
      assistant: 'bg-gradient-to-br from-gray-800/60 to-gray-700/30 border-gray-700 self-start rounded-bl-sm',
      error: 'bg-red-500/20 border-red-500/50 self-start rounded-bl-sm'
    };
    
    const icon = {
      user: <User className="h-4 w-4 text-white" />,
      assistant: <Brain className="h-4 w-4 text-black" />,
      error: <AlertTriangle className="h-4 w-4 text-red-300" />
    };

    const iconBg = {
      user: 'bg-gray-600',
      assistant: 'bg-gradient-to-br from-white to-gray-300',
      error: 'bg-red-900/50'
    };

    return (
      <div className={`flex gap-3 max-w-4xl w-full mx-auto ${isUser ? 'justify-end' : 'justify-start'}`}>
        {!isUser && (
          <div className={`w-8 h-8 rounded-full ${iconBg[message.role]} flex items-center justify-center flex-shrink-0 mt-1`}>
            {icon[message.role]}
          </div>
        )}
        <div className={`border rounded-2xl p-4 max-w-2xl shadow-lg shadow-black/20 ${bubbleStyles[message.role]}`}>
          <p className={`text-white whitespace-pre-wrap ${isError ? 'text-red-200' : ''}`}>{message.content}</p>
        </div>
         {isUser && (
          <div className={`w-8 h-8 rounded-full ${iconBg.user} flex items-center justify-center flex-shrink-0 mt-1`}>
            {icon.user}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative z-10 min-h-screen flex font-inter">
      {/* Sidebar */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-64 bg-gray-900/80 backdrop-blur-sm border-r border-white/20 flex-col hidden md:flex"
      >
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-orbitron font-bold text-white">Tela.ai</h1>
          <p className="text-xs text-gray-400 mt-1">Neural Interface v2.1</p>
        </div>
        <nav className="flex-1 p-4">
          {sidebarItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 p-3 rounded-lg mb-2 transition-all ${activeTab === item.id ? 'bg-white/20 text-white border border-white/30' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}>
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-white to-gray-300 flex items-center justify-center ${isTyping ? 'animate-pulse-slow' : ''}`}>
              <Brain className="h-5 w-5 text-black" />
            </div>
            <div>
              <p className="text-white font-medium">Neural Core</p>
              <p className="text-xs text-gray-400">{isTyping ? 'Processing...' : 'Online'}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-black/30">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} className="bg-gray-900/60 backdrop-blur-sm border-b border-white/20 p-4">
          <h2 className="text-xl font-semibold text-white capitalize">{sidebarItems.find(item => item.id === activeTab)?.label || 'Neural Chat'}</h2>
        </motion.div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6">
              {messages.map((msg, index) => <MessageBubble key={index} message={msg} />)}
              {isTyping && (
                <div className="flex gap-4 max-w-4xl w-full mx-auto justify-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white to-gray-300 flex items-center justify-center flex-shrink-0 animate-pulse-slow">
                    <Brain className="h-4 w-4 text-black" />
                  </div>
                  <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/30 border border-white/20 rounded-2xl rounded-bl-sm p-4">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="px-6 pb-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-wrap gap-2 mb-4">
                {suggestions.map((suggestion, index) => (
                  <button key={index} onClick={() => handleSendMessage(suggestion.text)} className="bg-gray-800/60 hover:bg-white/20 border border-gray-700 hover:border-white/30 text-gray-300 hover:text-white px-4 py-2 rounded-full text-sm transition-all flex items-center gap-2">
                    <suggestion.icon className="h-4 w-4" />
                    {suggestion.text}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.4 }} className="bg-gray-900/60 backdrop-blur-sm border-t border-white/20 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-2xl p-2 flex items-end gap-2">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Engage neural interface..."
                  className="flex-1 bg-transparent text-white placeholder-gray-400 resize-none outline-none p-2 max-h-40"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <div className="flex items-center gap-1">
                  <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10">
                    <Paperclip className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10">
                    <Mic className="h-5 w-5" />
                  </button>
                  <button onClick={() => handleSendMessage()} disabled={!inputMessage.trim() || isTyping} className="p-2 bg-white hover:bg-gray-200 disabled:bg-gray-700 text-black rounded-lg transition-colors disabled:cursor-not-allowed">
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
