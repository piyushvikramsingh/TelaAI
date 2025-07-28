import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Lightbulb, Zap, HelpCircle, Loader } from 'lucide-react';
import { jarvy, JarvyResponse } from '../services/jarvy';
import { useAuthStore } from '../store/authStore';
import { useChatStore, Message } from '../store/chatStore';
import { formatDistanceToNow } from 'date-fns';

interface JarvyChatProps {
  chatId: string;
  darkMode?: boolean;
}

const JarvyChat: React.FC<JarvyChatProps> = ({ chatId, darkMode = false }) => {
  const { user } = useAuthStore();
  const { selectedChat, addMessage, updateMessage } = useChatStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [quickSuggestions, setQuickSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadQuickSuggestions();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadQuickSuggestions = async () => {
    const suggestions = await jarvy.getQuickSuggestions();
    setQuickSuggestions(suggestions);
  };

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || !selectedChat || !user) return;

    // Add user message
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      text,
      senderId: user.id,
      senderName: user.name,
      timestamp: new Date().toISOString(),
      status: 'sent',
      reactions: [],
      messageType: 'text',
      replyTo: null,
      forwarded: false,
      starred: false,
      edited: false
    };

    addMessage(selectedChat.id, userMessage);
    setInput('');
    setSuggestions([]);

    // Show typing indicator
    setIsTyping(true);

    try {
      // Get AI response
      const response: JarvyResponse = await jarvy.getResponse(text);
      
      // Simulate typing delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      // Add Jarvy's response
      const jarvyMessage: Message = {
        id: `msg_${Date.now()}_jarvy`,
        text: response.text,
        senderId: 'jarvy',
        senderName: 'Jarvy AI Assistant',
        timestamp: new Date().toISOString(),
        status: 'read',
        reactions: [],
        messageType: 'text',
        replyTo: null,
        forwarded: false,
        starred: false,
        edited: false
      };

      addMessage(selectedChat.id, jarvyMessage);

      // Set suggestions if available
      if (response.suggestions) {
        setSuggestions(response.suggestions);
      }

    } catch (error) {
      console.error('Error getting Jarvy response:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        text: "I'm sorry, I encountered an error. Please try again or ask me something else!",
        senderId: 'jarvy',
        senderName: 'Jarvy AI Assistant',
        timestamp: new Date().toISOString(),
        status: 'read',
        reactions: [],
        messageType: 'text',
        replyTo: null,
        forwarded: false,
        starred: false,
        edited: false
      };

      addMessage(selectedChat.id, errorMessage);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatMessageText = (text: string) => {
    // Convert markdown-like formatting to HTML
    return text
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>');
  };

  if (!selectedChat || selectedChat.participants[1] !== 'jarvy') {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Jarvy Header */}
      <div className={`p-4 border-b ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-green-50 border-green-200'}`}>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl">
              🤖
            </div>
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
          </div>
          <div>
            <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Jarvy AI Assistant
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {isTyping ? 'Typing...' : 'Online • AI Assistant'}
            </p>
          </div>
          <div className="ml-auto">
            <Bot className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {selectedChat.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-4xl mb-4">
              🤖
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Hi! I'm Jarvy, your AI assistant
            </h3>
            <p className={`text-sm mb-6 max-w-md ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              I can help you with Chattyy features, answer questions, and provide assistance. What would you like to know?
            </p>
            
            {/* Quick Suggestions */}
            <div className="space-y-2 w-full max-w-sm">
              <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Try asking:
              </p>
              {quickSuggestions.slice(0, 3).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full p-3 rounded-lg text-left text-sm transition-colors ${
                    darkMode 
                      ? 'bg-gray-800 hover:bg-gray-700 text-gray-200' 
                      : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
                  }`}
                >
                  <HelpCircle className="inline w-4 h-4 mr-2 opacity-60" />
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {selectedChat.messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div className="flex items-start space-x-2 max-w-xs lg:max-w-md">
                  {msg.senderId === 'jarvy' && (
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-sm flex-shrink-0">
                      🤖
                    </div>
                  )}
                  <div
                    className={`px-4 py-2 rounded-lg ${
                      msg.senderId === user?.id
                        ? 'bg-green-500 text-white'
                        : darkMode 
                          ? 'bg-gray-700 text-white' 
                          : 'bg-white text-gray-800 border border-gray-200'
                    }`}
                  >
                    <div 
                      className="text-sm"
                      dangerouslySetInnerHTML={{ __html: formatMessageText(msg.text) }}
                    />
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-xs ${
                        msg.senderId === user?.id 
                          ? 'text-green-100' 
                          : darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {formatTime(msg.timestamp)}
                      </span>
                      {msg.senderId === 'jarvy' && (
                        <Bot className={`w-3 h-3 ml-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-sm">
                    🤖
                  </div>
                  <div className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white border border-gray-200'}`}>
                    <div className="flex space-x-1">
                      <div className={`w-2 h-2 rounded-full animate-bounce ${darkMode ? 'bg-gray-400' : 'bg-gray-500'}`} style={{ animationDelay: '0ms' }}></div>
                      <div className={`w-2 h-2 rounded-full animate-bounce ${darkMode ? 'bg-gray-400' : 'bg-gray-500'}`} style={{ animationDelay: '150ms' }}></div>
                      <div className={`w-2 h-2 rounded-full animate-bounce ${darkMode ? 'bg-gray-400' : 'bg-gray-500'}`} style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className={`p-4 border-t ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center space-x-2 mb-2">
            <Lightbulb className={`w-4 h-4 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
            <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Suggested questions:
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`px-3 py-1 rounded-full text-xs transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className={`p-4 border-t ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Ask Jarvy anything..."
              className={`w-full px-4 py-2 pr-10 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'
              }`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              disabled={isTyping}
            />
            <Zap className={`absolute right-3 top-2.5 w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
          
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isTyping}
            className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTyping ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JarvyChat;