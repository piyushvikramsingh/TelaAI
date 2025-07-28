import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
import ChattyPage from './pages/ChattyPage';
import VideoCallPage from './pages/VideoCallPage';
import StatusPage from './pages/StatusPage';
import { useAuthStore } from './store/authStore';

function App() {
  const { user } = useAuthStore();

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
