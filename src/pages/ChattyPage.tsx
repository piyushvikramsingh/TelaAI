import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Send, Phone, Video, MoreVertical, Search, Paperclip, Mic, Smile, 
  ArrowLeft, Check, CheckCheck, Camera, Image, FileText, MapPin,
  Archive, Pin, Star, Trash2, Forward, Reply, Copy, Download,
  VolumeX, Volume2, Play, Pause, MicOff, VideoOff, PhoneOff,
  Users, Settings, Moon, Sun, Bell, BellOff, Lock, Shield, Plus,
  MessageCircle, Eye, Clock, Edit3, X, Menu, Bot
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useChatStore, Message, Chat } from '../store/chatStore';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import EmojiPicker from 'emoji-picker-react';
import JarvyChat from '../components/JarvyChat';
import JarvyTraining from '../components/JarvyTraining';

const ChattyPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const {
    chats,
    contacts,
    selectedChat,
    onlineUsers,
    connectionStatus,
    setSelectedChat,
    addMessage,
    updateMessage,
    addReaction,
    markMessagesAsRead,
    setConnectionStatus,
    addChat
  } = useChatStore();

  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showTraining, setShowTraining] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [activeTab, setActiveTab] = useState<'chats' | 'status' | 'calls'>('chats');
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const [showMessageActions, setShowMessageActions] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);

  // Initialize connection
  useEffect(() => {
    setConnectionStatus('connected');
  }, [setConnectionStatus]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages]);

  // Send message
  const sendMessage = useCallback(() => {
    if (!message.trim() || !selectedChat || !user) return;

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      text: message,
      senderId: user.id,
      senderName: user.name,
      timestamp: new Date().toISOString(),
      status: 'sending',
      reactions: [],
      messageType: 'text',
      replyTo: replyTo?.id,
      forwarded: false,
      starred: false,
      edited: false
    };

    addMessage(selectedChat.id, newMessage);
    setMessage('');
    setReplyTo(null);

    // Simulate message status updates
    setTimeout(() => updateMessage(selectedChat.id, newMessage.id, { status: 'sent' }), 500);
    setTimeout(() => updateMessage(selectedChat.id, newMessage.id, { status: 'delivered' }), 1000);
    setTimeout(() => updateMessage(selectedChat.id, newMessage.id, { status: 'read' }), 3000);
  }, [message, selectedChat, user, replyTo, addMessage, updateMessage]);

  // File upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length || !selectedChat || !user) return;

    files.forEach(file => {
      const fileMessage: Message = {
        id: `msg_${Date.now()}_${Math.random()}`,
        text: file.name,
        senderId: user.id,
        senderName: user.name,
        timestamp: new Date().toISOString(),
        status: 'sending',
        reactions: [],
        messageType: file.type.startsWith('image/') ? 'image' : 
                     file.type.startsWith('video/') ? 'video' : 
                     file.type.startsWith('audio/') ? 'audio' : 'file',
        fileData: {
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file)
        },
        replyTo: null,
        forwarded: false,
        starred: false,
        edited: false
      };

      addMessage(selectedChat.id, fileMessage);
    });

    event.target.value = '';
  }, [selectedChat, user, addMessage]);

  // Voice recording
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        if (selectedChat && user) {
          const audioMessage: Message = {
            id: `msg_${Date.now()}`,
            text: 'Voice message',
            senderId: user.id,
            senderName: user.name,
            timestamp: new Date().toISOString(),
            status: 'sending',
            reactions: [],
            messageType: 'audio',
            fileData: {
              name: `voice_${Date.now()}.wav`,
              size: blob.size,
              type: 'audio/wav',
              url: URL.createObjectURL(blob),
              duration: recordingTime
            },
            replyTo: null,
            forwarded: false,
            starred: false,
            edited: false
          };

          addMessage(selectedChat.id, audioMessage);
        }
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingInterval.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      toast.error('Could not access microphone');
    }
  }, [selectedChat, user, recordingTime, addMessage]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
    }
    setIsRecording(false);
    setRecordingTime(0);
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
    }
  }, []);

  // Create new chat
  const createNewChat = useCallback((contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact || !user) return;

    const existingChat = chats.find(chat => 
      chat.type === 'individual' && chat.participants.includes(contactId)
    );

    if (existingChat) {
      setSelectedChat(existingChat);
      return;
    }

    const newChat: Chat = {
      id: `chat_${Date.now()}`,
      name: contact.name,
      type: 'individual',
      participants: [user.id, contactId],
      avatar: contact.avatar,
      messages: [],
      lastMessage: '',
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0,
      pinned: false,
      archived: false,
      muted: false
    };

    addChat(newChat);
    setSelectedChat(newChat);
    setShowSidebar(false);
  }, [contacts, chats, user, setSelectedChat, addChat]);

  // Get status icon
  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'sending': return <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />;
      case 'sent': return <Check className="w-3 h-3" />;
      case 'delivered': return <CheckCheck className="w-3 h-3" />;
      case 'read': return <CheckCheck className="w-3 h-3 text-blue-400" />;
      default: return null;
    }
  }, []);

  // Handle reaction
  const handleReaction = useCallback((messageId: string, emoji: string) => {
    if (!selectedChat || !user) return;
    addReaction(selectedChat.id, messageId, { emoji, userId: user.id, userName: user.name });
  }, [selectedChat, user, addReaction]);

  // Format time
  const formatTime = useCallback((timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }, []);

  // Filter chats
  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase()) && !chat.archived
  );

  // Start video call
  const startVideoCall = useCallback(() => {
    if (!selectedChat) return;
    const roomId = `room_${selectedChat.id}_${Date.now()}`;
    navigate(`/video-call/${roomId}`);
  }, [selectedChat, navigate]);

  // Start voice call
  const startVoiceCall = useCallback(() => {
    if (!selectedChat) return;
    toast.success('Voice call started');
    // In a real app, implement WebRTC voice calling
  }, [selectedChat]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
      {/* Sidebar */}
      <div className={`${selectedChat && !showSidebar ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-1/3 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        {/* Header */}
        <div className={`p-4 ${darkMode ? 'bg-gray-750' : 'bg-gray-50'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full flex items-center justify-center`}>
                {user.avatar || '👤'}
              </div>
              <div>
                <h1 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Chattyy
                </h1>
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${
                    connectionStatus === 'connected' ? 'bg-green-500' : 
                    connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-xs text-gray-500 capitalize">{connectionStatus}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => setShowTraining(true)}
                className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                title="Train Jarvy AI"
              >
                <Bot className="w-4 h-4 text-purple-600" />
              </button>
              <button 
                onClick={() => navigate('/status')}
                className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
              >
                <Eye className="w-4 h-4" />
              </button>
              <button 
                onClick={logout}
                className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className={`absolute left-3 top-3 w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search or start new chat"
              className={`w-full pl-10 pr-4 py-2 ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'} rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Tabs */}
          <div className="flex mt-4 space-x-1 bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
            {(['chats', 'status', 'calls'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content based on active tab */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'chats' && (
            <>
              {/* New Chat Contacts */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2 overflow-x-auto">
                  {contacts.map(contact => (
                    <button
                      key={contact.id}
                      onClick={() => createNewChat(contact.id)}
                      className={`flex-shrink-0 flex flex-col items-center p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} ${contact.id === 'jarvy' ? 'ring-2 ring-blue-400' : ''}`}
                    >
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg mb-1 ${
                          contact.id === 'jarvy' 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                            : 'bg-gray-200 dark:bg-gray-600'
                        }`}>
                          {contact.avatar}
                        </div>
                        {contact.isOnline && (
                          <div className={`absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-white ${
                            contact.id === 'jarvy' ? 'bg-green-500 animate-pulse' : 'bg-green-500'
                          }`}></div>
                        )}
                        {contact.id === 'jarvy' && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <Bot className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </div>
                      <span className={`text-xs text-center ${contact.id === 'jarvy' ? 'font-medium text-blue-600 dark:text-blue-400' : ''}`}>
                        {contact.id === 'jarvy' ? 'Jarvy AI' : contact.name.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat List */}
              {filteredChats.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    No chats yet. Click on a contact above to start messaging!
                  </p>
                </div>
              ) : (
                filteredChats.map(chat => (
                  <div
                    key={chat.id}
                    className={`flex items-center p-4 hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'} cursor-pointer border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'} ${
                      selectedChat?.id === chat.id ? (darkMode ? 'bg-gray-700' : 'bg-green-50') : ''
                    } ${chat.participants.includes('jarvy') ? 'border-l-4 border-l-blue-500' : ''}`}
                    onClick={() => {
                      setSelectedChat(chat);
                      setShowSidebar(false);
                      markMessagesAsRead(chat.id);
                    }}
                  >
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                        chat.participants.includes('jarvy') 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                          : darkMode ? 'bg-gray-600' : 'bg-gray-200'
                      }`}>
                        {chat.avatar}
                      </div>
                      {onlineUsers.has(chat.participants?.find(p => p !== user.id) || '') && (
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                          chat.participants.includes('jarvy') ? 'bg-green-500 animate-pulse' : 'bg-green-500'
                        }`}></div>
                      )}
                      {chat.participants.includes('jarvy') && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <Bot className="w-2 h-2 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {chat.name}
                        </h3>
                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {chat.lastMessageTime ? formatTime(chat.lastMessageTime) : ''}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} truncate`}>
                          {chat.lastMessage || 'No messages yet'}
                        </p>
                        {chat.unreadCount > 0 && (
                          <span className="bg-green-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === 'status' && (
            <div className="p-4">
              <div className="text-center">
                <div className="text-6xl mb-4">👁️</div>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                  No status updates yet
                </p>
                <button
                  onClick={() => navigate('/status')}
                  className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600"
                >
                  Add Status
                </button>
              </div>
            </div>
          )}

          {activeTab === 'calls' && (
            <div className="p-4">
              <div className="text-center">
                <div className="text-6xl mb-4">📞</div>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  No recent calls
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedChat ? (
        <>
          {/* Check if this is Jarvy chat */}
          {selectedChat.participants.includes('jarvy') ? (
            <JarvyChat chatId={selectedChat.id} darkMode={darkMode} />
          ) : (
            <div className="flex flex-col flex-1">
              {/* Chat Header */}
              <div className={`p-4 ${darkMode ? 'bg-gray-750' : 'bg-gray-50'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
                <div className="flex items-center">
                  <button
                    onClick={() => setShowSidebar(true)}
                    className={`md:hidden mr-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className={`w-10 h-10 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full flex items-center justify-center text-lg`}>
                    {selectedChat.avatar}
                  </div>
                  <div className="ml-3">
                    <h2 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedChat.name}
                    </h2>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {onlineUsers.has(selectedChat.participants?.find(p => p !== user.id) || '') ? 'Online' : 'Last seen recently'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={startVoiceCall}
                    className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'} cursor-pointer hover:text-green-500`}
                  >
                    <Phone className="w-5 h-5" />
                  </button>
                  <button
                    onClick={startVideoCall}
                    className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'} cursor-pointer hover:text-green-500`}
                  >
                    <Video className="w-5 h-5" />
                  </button>
                  <MoreVertical className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'} cursor-pointer`} />
                </div>
              </div>

          {/* Messages */}
          <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            {selectedChat.messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-6xl mb-4">🔒</div>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                    Messages are end-to-end encrypted
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    Start a conversation with {selectedChat.name}
                  </p>
                </div>
              </div>
            ) : (
              selectedChat.messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative group ${
                      msg.senderId === user.id
                        ? 'bg-green-500 text-white'
                        : darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800 border border-gray-200'
                    }`}
                    onDoubleClick={() => handleReaction(msg.id, '❤️')}
                  >
                    {/* Reply indicator */}
                    {msg.replyTo && (
                      <div className={`text-xs mb-2 p-2 rounded ${msg.senderId === user.id ? 'bg-green-600' : 'bg-gray-600'}`}>
                        Replying to message
                      </div>
                    )}

                    {/* Message content */}
                    {msg.messageType === 'text' && (
                      <p className="text-sm">{msg.text}</p>
                    )}
                    
                    {msg.messageType === 'image' && (
                      <div>
                        <img src={msg.fileData?.url} alt={msg.text} className="max-w-full rounded mb-2" />
                        <p className="text-xs">{msg.text}</p>
                      </div>
                    )}
                    
                    {msg.messageType === 'audio' && (
                      <div className="flex items-center space-x-2">
                        <Play className="w-4 h-4" />
                        <span className="text-sm">Voice message ({msg.fileData?.duration || 0}s)</span>
                      </div>
                    )}
                    
                    {msg.messageType === 'file' && (
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4" />
                        <div>
                          <p className="text-sm">{msg.text}</p>
                          <p className="text-xs opacity-75">{((msg.fileData?.size || 0) / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Reactions */}
                    {msg.reactions.length > 0 && (
                      <div className="flex space-x-1 mt-1">
                        {msg.reactions.map((reaction, i) => (
                          <span key={i} className="text-xs bg-white bg-opacity-20 rounded-full px-1">
                            {reaction.emoji}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Message info */}
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-xs ${msg.senderId === user.id ? 'text-green-100' : darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {formatTime(msg.timestamp)}
                      </span>
                      <div className="flex items-center ml-2">
                        {msg.starred && <Star className="w-3 h-3 mr-1 text-yellow-400" />}
                        {msg.forwarded && <Forward className="w-3 h-3 mr-1" />}
                        {msg.senderId === user.id && (
                          <div className={`${msg.senderId === user.id ? 'text-green-100' : 'text-gray-500'}`}>
                            {getStatusIcon(msg.status)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Message actions */}
                    <div className="absolute top-0 right-0 hidden group-hover:flex bg-gray-800 rounded-lg p-1 space-x-1 transform translate-x-full -translate-y-2">
                      <button
                        onClick={() => setReplyTo(msg)}
                        className="p-1 hover:bg-gray-700 rounded"
                      >
                        <Reply className="w-3 h-3 text-white" />
                      </button>
                      <button
                        onClick={() => handleReaction(msg.id, '❤️')}
                        className="p-1 hover:bg-gray-700 rounded"
                      >
                        ❤️
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply indicator */}
          {replyTo && (
            <div className={`p-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} border-t border-gray-200 dark:border-gray-600`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Reply className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Replying to {replyTo.senderName}</span>
                </div>
                <button onClick={() => setReplyTo(null)}>
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <p className="text-sm text-gray-500 truncate mt-1">{replyTo.text}</p>
            </div>
          )}

          {/* Recording indicator */}
          {isRecording && (
            <div className="flex items-center justify-center mb-2 p-2 bg-red-50 dark:bg-red-900 rounded mx-4">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-sm">Recording... {recordingTime}s</span>
              <button onClick={stopRecording} className="ml-4 text-red-500">
                <MicOff className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Message Input */}
          <div className={`p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                multiple
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <Paperclip className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              </button>
              
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className={`w-full px-4 py-2 pr-10 ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'} rounded-full focus:outline-none focus:ring-2 focus:ring-green-500`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="absolute right-3 top-2.5"
                >
                  <Smile className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'} cursor-pointer`} />
                </button>
                
                {showEmojiPicker && (
                  <div className="absolute bottom-full right-0 mb-2">
                    <EmojiPicker
                      onEmojiClick={(emojiData) => {
                        setMessage(prev => prev + emojiData.emoji);
                        setShowEmojiPicker(false);
                      }}
                      theme={darkMode ? 'dark' : 'light'}
                    />
                  </div>
                )}
              </div>
              
              {message.trim() ? (
                <button
                  onClick={sendMessage}
                  className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              ) : (
                <button 
                  onMouseDown={startRecording}
                  onMouseUp={stopRecording}
                  onMouseLeave={stopRecording}
                  className={`w-10 h-10 ${isRecording ? 'bg-red-500' : 'bg-green-500'} text-white rounded-full flex items-center justify-center hover:opacity-80 transition-colors`}
                >
                  <Mic className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
          )}
        </>
      ) : (
        <div className={`hidden md:flex flex-1 items-center justify-center ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="text-center">
            <div className={`w-32 h-32 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full flex items-center justify-center text-6xl mb-4 mx-auto`}>
              💬
            </div>
            <h2 className={`text-xl font-medium ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>
              Chattyy Web
            </h2>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
              Send and receive messages without keeping your phone online.
            </p>
            <div className="mb-4">
              <button
                onClick={() => createNewChat('jarvy')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full hover:shadow-lg transition-all duration-300 flex items-center space-x-2 mx-auto"
              >
                <Bot className="w-5 h-5" />
                <span>Chat with Jarvy AI</span>
              </button>
              <p className="text-xs text-gray-500 mt-2">Get instant help and answers</p>
            </div>
            <div className="text-sm text-gray-500 flex items-center justify-center">
              <Shield className="w-4 h-4 mr-2" />
              Your personal messages are end-to-end encrypted
            </div>
          </div>
        </div>
      )}

      {/* Floating Jarvy Button */}
      {!selectedChat?.participants.includes('jarvy') && (
        <button
          onClick={() => createNewChat('jarvy')}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50 flex items-center justify-center group"
          title="Chat with Jarvy AI Assistant"
        >
          <Bot className="w-6 h-6" />
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Chat with Jarvy AI
          </div>
        </button>
      )}

      {/* Jarvy Training Interface */}
      {showTraining && (
        <JarvyTraining 
          darkMode={darkMode} 
          onClose={() => setShowTraining(false)} 
        />
      )}
    </div>
  );
};

export default ChattyPage;