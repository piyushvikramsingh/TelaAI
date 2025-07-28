import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Video, VideoOff, Mic, MicOff, Phone, PhoneOff, 
  Camera, Monitor, Volume2, Settings, MessageSquare,
  Users, MoreVertical, Maximize, Minimize, X
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import toast from 'react-hot-toast';

const VideoCallPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { selectedChat } = useChatStore();

  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [participants, setParticipants] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize video call
  useEffect(() => {
    initializeCall();
    return () => {
      endCall();
    };
  }, []);

  // Call timer
  useEffect(() => {
    if (isCallActive) {
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    }

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [isCallActive]);

  // Auto-hide controls
  useEffect(() => {
    const resetControlsTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    if (showControls) {
      resetControlsTimeout();
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls]);

  const initializeCall = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Initialize peer connection
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      peerConnectionRef.current = peerConnection;

      // Add local stream tracks
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        const state = peerConnection.connectionState;
        if (state === 'connected') {
          setConnectionStatus('connected');
          setIsCallActive(true);
          toast.success('Call connected');
        } else if (state === 'disconnected' || state === 'failed') {
          setConnectionStatus('disconnected');
          toast.error('Call disconnected');
        }
      };

      setConnectionStatus('connected');
      setIsCallActive(true);
      
      // Simulate connecting to remote peer
      setTimeout(() => {
        toast.success('Connected to call');
      }, 2000);

    } catch (error) {
      console.error('Error initializing call:', error);
      toast.error('Failed to access camera/microphone');
      navigate('/chat');
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });

        // Replace video track
        if (peerConnectionRef.current) {
          const sender = peerConnectionRef.current.getSenders().find(
            s => s.track && s.track.kind === 'video'
          );
          if (sender) {
            await sender.replaceTrack(screenStream.getVideoTracks()[0]);
          }
        }

        // Update local video
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        setIsScreenSharing(true);
        toast.success('Screen sharing started');

        // Handle screen share end
        screenStream.getVideoTracks()[0].onended = () => {
          stopScreenShare();
        };
      } else {
        stopScreenShare();
      }
    } catch (error) {
      toast.error('Failed to start screen sharing');
    }
  };

  const stopScreenShare = async () => {
    try {
      // Get camera stream back
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      // Replace screen share track with camera
      if (peerConnectionRef.current) {
        const sender = peerConnectionRef.current.getSenders().find(
          s => s.track && s.track.kind === 'video'
        );
        if (sender) {
          await sender.replaceTrack(cameraStream.getVideoTracks()[0]);
        }
      }

      // Update local video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = cameraStream;
      }

      localStreamRef.current = cameraStream;
      setIsScreenSharing(false);
      toast.success('Screen sharing stopped');
    } catch (error) {
      toast.error('Failed to stop screen sharing');
    }
  };

  const endCall = () => {
    // Stop all tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    // Clear timers
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }

    setIsCallActive(false);
    toast.success('Call ended');
    navigate('/chat');
  };

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div 
      className="relative h-screen bg-black overflow-hidden"
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Remote Video (Main) */}
      <div className="absolute inset-0">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        
        {/* Remote video placeholder */}
        {!remoteVideoRef.current?.srcObject && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center text-4xl mb-4 mx-auto">
                {selectedChat?.avatar || '👤'}
              </div>
              <h3 className="text-white text-xl mb-2">{selectedChat?.name || 'Connecting...'}</h3>
              <p className="text-gray-400">
                {connectionStatus === 'connecting' ? 'Connecting...' : 
                 connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Local Video (Picture-in-Picture) */}
      <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden shadow-lg">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        {/* Local video placeholder */}
        {!isVideoEnabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center text-2xl">
              {user.avatar || '👤'}
            </div>
          </div>
        )}

        {/* Local controls indicator */}
        <div className="absolute bottom-2 left-2 flex space-x-1">
          {!isVideoEnabled && (
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <VideoOff className="w-3 h-3 text-white" />
            </div>
          )}
          {!isAudioEnabled && (
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <MicOff className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Top Bar */}
      <div className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/50 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/chat')}
              className="text-white hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="text-white">
              <h2 className="font-semibold">{selectedChat?.name || 'Video Call'}</h2>
              <p className="text-sm text-gray-300">
                {isCallActive ? formatCallDuration(callDuration) : 'Connecting...'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500' : 
              connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="text-white text-sm capitalize">{connectionStatus}</span>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center justify-center space-x-6">
          {/* Audio Toggle */}
          <button
            onClick={toggleAudio}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              isAudioEnabled 
                ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          {/* Video Toggle */}
          <button
            onClick={toggleVideo}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              isVideoEnabled 
                ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          {/* Screen Share */}
          <button
            onClick={toggleScreenShare}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              isScreenSharing 
                ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                : 'bg-gray-600 hover:bg-gray-500 text-white'
            }`}
          >
            <Monitor className="w-5 h-5" />
          </button>

          {/* End Call */}
          <button
            onClick={endCall}
            className="w-14 h-14 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <PhoneOff className="w-6 h-6" />
          </button>

          {/* Chat */}
          <button
            onClick={() => {
              // In a real app, open chat overlay
              toast.info('Chat feature coming soon');
            }}
            className="w-12 h-12 bg-gray-600 hover:bg-gray-500 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="w-12 h-12 bg-gray-600 hover:bg-gray-500 rounded-full flex items-center justify-center text-white transition-colors"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>

          {/* More Options */}
          <button
            onClick={() => toast.info('More options coming soon')}
            className="w-12 h-12 bg-gray-600 hover:bg-gray-500 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Call Status Overlay */}
      {connectionStatus === 'connecting' && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-white text-lg">Connecting to call...</p>
          </div>
        </div>
      )}

      {/* Participant Count */}
      {participants.length > 0 && (
        <div className="absolute top-4 left-4 bg-black/50 rounded-lg px-3 py-2 text-white">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span className="text-sm">{participants.length + 1}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCallPage;