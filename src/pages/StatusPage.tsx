import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Camera, Type, Palette, Send, X, Eye, 
  EyeOff, Play, Pause, Volume2, VolumeX, MoreVertical,
  Clock, Users, Download, Share, Heart, Smile
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useChatStore, Status } from '../store/chatStore';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const StatusPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { statuses, contacts, addStatus, markStatusAsViewed } = useChatStore();

  const [selectedStatus, setSelectedStatus] = useState<Status | null>(null);
  const [showCreateStatus, setShowCreateStatus] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [statusType, setStatusType] = useState<'text' | 'image' | 'video'>('text');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [backgroundColor, setBackgroundColor] = useState('#075E54');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
  const [statusTimer, setStatusTimer] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const statusProgressRef = useRef<NodeJS.Timeout | null>(null);

  const backgroundColors = [
    '#075E54', '#128C7E', '#25D366', '#DCF8C6', '#34B7F1',
    '#9C27B0', '#E91E63', '#F44336', '#FF9800', '#4CAF50',
    '#2196F3', '#673AB7', '#795548', '#607D8B', '#000000'
  ];

  // Group statuses by user
  const groupedStatuses = statuses.reduce((acc, status) => {
    if (!acc[status.userId]) {
      acc[status.userId] = [];
    }
    acc[status.userId].push(status);
    return acc;
  }, {} as Record<string, Status[]>);

  // Auto-advance status viewing
  useEffect(() => {
    if (selectedStatus && groupedStatuses[selectedStatus.userId]) {
      const userStatuses = groupedStatuses[selectedStatus.userId];
      const currentIndex = userStatuses.findIndex(s => s.id === selectedStatus.id);
      
      statusProgressRef.current = setTimeout(() => {
        if (currentIndex < userStatuses.length - 1) {
          setSelectedStatus(userStatuses[currentIndex + 1]);
          setCurrentStatusIndex(currentIndex + 1);
        } else {
          setSelectedStatus(null);
          setCurrentStatusIndex(0);
        }
      }, 7000); // 7 seconds per status

      return () => {
        if (statusProgressRef.current) {
          clearTimeout(statusProgressRef.current);
        }
      };
    }
  }, [selectedStatus, groupedStatuses]);

  const createTextStatus = () => {
    if (!statusText.trim() || !user) return;

    const newStatus: Status = {
      id: `status_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar || '👤',
      type: 'text',
      content: statusText,
      text: statusText,
      backgroundColor,
      timestamp: new Date().toISOString(),
      views: [],
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };

    addStatus(newStatus);
    setShowCreateStatus(false);
    setStatusText('');
    toast.success('Status posted successfully');
  };

  const createMediaStatus = async () => {
    if (!selectedFile || !user) return;

    const newStatus: Status = {
      id: `status_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar || '👤',
      type: selectedFile.type.startsWith('video/') ? 'video' : 'image',
      content: URL.createObjectURL(selectedFile),
      text: statusText,
      timestamp: new Date().toISOString(),
      views: [],
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    addStatus(newStatus);
    setShowCreateStatus(false);
    setSelectedFile(null);
    setStatusText('');
    toast.success('Status posted successfully');
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setStatusType(file.type.startsWith('video/') ? 'video' : 'image');
    }
  };

  const viewStatus = (status: Status) => {
    setSelectedStatus(status);
    setCurrentStatusIndex(0);
    if (user && status.userId !== user.id) {
      markStatusAsViewed(status.id, user.id);
    }
  };

  const getStatusPreview = (userStatuses: Status[]) => {
    const latestStatus = userStatuses[userStatuses.length - 1];
    if (latestStatus.type === 'text') {
      return (
        <div 
          className="w-full h-full flex items-center justify-center text-white text-sm font-medium text-center p-2"
          style={{ backgroundColor: latestStatus.backgroundColor }}
        >
          {latestStatus.text?.slice(0, 50) + (latestStatus.text && latestStatus.text.length > 50 ? '...' : '')}
        </div>
      );
    } else {
      return (
        <img 
          src={latestStatus.content} 
          alt="Status" 
          className="w-full h-full object-cover"
        />
      );
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-green-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/chat')}
            className="mr-4 hover:bg-green-700 p-2 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold">Status</h1>
        </div>
        <button
          onClick={() => setShowCreateStatus(true)}
          className="bg-green-700 hover:bg-green-800 p-2 rounded-full"
        >
          <Camera className="w-5 h-5" />
        </button>
      </div>

      {/* Status List */}
      <div className="p-4 space-y-6">
        {/* My Status */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">My Status</h2>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-2xl">
                {user.avatar}
              </div>
              <button
                onClick={() => setShowCreateStatus(true)}
                className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white"
              >
                <Camera className="w-3 h-3" />
              </button>
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-white">My Status</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {groupedStatuses[user.id]?.length > 0 
                  ? `${groupedStatuses[user.id].length} update${groupedStatuses[user.id].length > 1 ? 's' : ''}`
                  : 'Add a status update'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Recent Updates */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Recent Updates</h2>
          <div className="space-y-3">
            {Object.entries(groupedStatuses)
              .filter(([userId]) => userId !== user.id)
              .map(([userId, userStatuses]) => {
                const contact = contacts.find(c => c.id === userId);
                const latestStatus = userStatuses[userStatuses.length - 1];
                const hasUnviewedStatus = userStatuses.some(s => 
                  !s.views.some(v => v.userId === user.id)
                );

                return (
                  <div
                    key={userId}
                    onClick={() => viewStatus(latestStatus)}
                    className="flex items-center space-x-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg"
                  >
                    <div className="relative">
                      <div className={`w-16 h-16 rounded-full overflow-hidden border-2 ${
                        hasUnviewedStatus ? 'border-green-500' : 'border-gray-300'
                      }`}>
                        {getStatusPreview(userStatuses)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 dark:text-white">
                        {contact?.name || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDistanceToNow(new Date(latestStatus.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex items-center text-gray-400">
                      <Eye className="w-4 h-4 mr-1" />
                      <span className="text-sm">{latestStatus.views.length}</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Status Viewer Modal */}
      {selectedStatus && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          {/* Progress bars */}
          <div className="flex space-x-1 p-2">
            {groupedStatuses[selectedStatus.userId]?.map((_, index) => (
              <div 
                key={index}
                className="flex-1 h-1 bg-gray-600 rounded overflow-hidden"
              >
                <div 
                  className={`h-full bg-white transition-all duration-7000 ${
                    index < currentStatusIndex ? 'w-full' : 
                    index === currentStatusIndex ? 'w-full animate-pulse' : 'w-0'
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="flex items-center justify-between p-4 text-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <div className="w-full h-full bg-gray-600 flex items-center justify-center text-lg">
                  {selectedStatus.userAvatar}
                </div>
              </div>
              <div>
                <p className="font-medium">{selectedStatus.userName}</p>
                <p className="text-sm text-gray-300">
                  {formatDistanceToNow(new Date(selectedStatus.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-700 rounded-full">
                <MoreVertical className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSelectedStatus(null)}
                className="p-2 hover:bg-gray-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Status Content */}
          <div className="flex-1 flex items-center justify-center">
            {selectedStatus.type === 'text' ? (
              <div 
                className="w-full h-full flex items-center justify-center text-white text-2xl font-medium text-center p-8"
                style={{ backgroundColor: selectedStatus.backgroundColor }}
              >
                {selectedStatus.text}
              </div>
            ) : selectedStatus.type === 'image' ? (
              <img 
                src={selectedStatus.content} 
                alt="Status" 
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <video 
                ref={videoRef}
                src={selectedStatus.content} 
                className="max-w-full max-h-full object-contain"
                autoPlay
                controls
              />
            )}
          </div>

          {/* Status text overlay */}
          {selectedStatus.text && selectedStatus.type !== 'text' && (
            <div className="absolute bottom-20 left-0 right-0 p-4">
              <div className="bg-black bg-opacity-50 rounded-lg p-3">
                <p className="text-white text-center">{selectedStatus.text}</p>
              </div>
            </div>
          )}

          {/* Bottom info */}
          <div className="p-4 text-white flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span className="text-sm">{selectedStatus.views.length} views</span>
              </div>
            </div>
            {selectedStatus.userId !== user.id && (
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-700 rounded-full">
                  <Heart className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-gray-700 rounded-full">
                  <Share className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Status Modal */}
      {showCreateStatus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Add Status</h2>
              <button
                onClick={() => {
                  setShowCreateStatus(false);
                  setSelectedFile(null);
                  setStatusText('');
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Type selector */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setStatusType('text')}
                  className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                    statusType === 'text' 
                      ? 'border-green-500 bg-green-50 dark:bg-green-900' 
                      : 'border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <Type className="w-6 h-6 mx-auto mb-2" />
                  <p className="text-sm font-medium">Text</p>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                    statusType !== 'text' 
                      ? 'border-green-500 bg-green-50 dark:bg-green-900' 
                      : 'border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <Camera className="w-6 h-6 mx-auto mb-2" />
                  <p className="text-sm font-medium">Photo/Video</p>
                </button>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*,video/*"
                className="hidden"
              />

              {/* Preview */}
              {statusType === 'text' ? (
                <div>
                  <div 
                    className="w-full h-48 rounded-lg flex items-center justify-center text-white text-lg font-medium text-center p-4"
                    style={{ backgroundColor }}
                  >
                    {statusText || 'Type your status...'}
                  </div>
                  
                  {/* Color picker */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {backgroundColors.map(color => (
                      <button
                        key={color}
                        onClick={() => setBackgroundColor(color)}
                        className={`w-8 h-8 rounded-full border-2 ${
                          backgroundColor === color ? 'border-white' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              ) : selectedFile ? (
                <div className="space-y-2">
                  {selectedFile.type.startsWith('image/') ? (
                    <img 
                      src={URL.createObjectURL(selectedFile)} 
                      alt="Preview" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ) : (
                    <video 
                      src={URL.createObjectURL(selectedFile)} 
                      className="w-full h-48 object-cover rounded-lg"
                      controls
                    />
                  )}
                </div>
              ) : (
                <div className="w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-500">Select a photo or video</p>
                  </div>
                </div>
              )}

              {/* Text input */}
              <textarea
                value={statusText}
                onChange={(e) => setStatusText(e.target.value)}
                placeholder={statusType === 'text' ? 'Type your status...' : 'Add a caption...'}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                rows={3}
                maxLength={200}
              />

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowCreateStatus(false);
                    setSelectedFile(null);
                    setStatusText('');
                  }}
                  className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={statusType === 'text' ? createTextStatus : createMediaStatus}
                  disabled={statusType === 'text' ? !statusText.trim() : !selectedFile}
                  className="flex-1 py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Post Status</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusPage;