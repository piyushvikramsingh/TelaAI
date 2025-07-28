import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
import ChattyPage from './pages/ChattyPage';
import VideoCallPage from './pages/VideoCallPage';
import StatusPage from './pages/StatusPage';
import { useAuthStore } from './store/authStore';
import { initializeJarvyTraining } from './services/autoTrainer';

function App() {
  const { user } = useAuthStore();

  // Initialize Jarvy training when app starts
  useEffect(() => {
    const trainJarvy = async () => {
      try {
        console.log('🚀 Initializing Jarvy AI training...');
        await initializeJarvyTraining('comprehensive');
        console.log('✅ Jarvy training completed successfully!');
      } catch (error) {
        console.warn('⚠️ Jarvy training failed, but app will continue:', error);
      }
    };

    // Run training in background
    trainJarvy();
  }, []);

  return (
    <Router>
      <div className="App">
        <Toaster position="top-center" />
        <Routes>
          <Route 
            path="/" 
            element={user ? <ChattyPage /> : <LoginPage />} 
          />
          <Route 
            path="/login" 
            element={<LoginPage />} 
          />
          <Route 
            path="/chat" 
            element={user ? <ChattyPage /> : <LoginPage />} 
          />
          <Route 
            path="/video-call/:roomId" 
            element={user ? <VideoCallPage /> : <LoginPage />} 
          />
          <Route 
            path="/status" 
            element={user ? <StatusPage /> : <LoginPage />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
