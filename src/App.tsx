import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import AboutPage from './pages/AboutPage';
import CareersPage from './pages/CareersPage';
import PrivacyPage from './pages/PrivacyPage';
import FAQPage from './pages/FAQPage';
import StarField from './components/StarField';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black text-white overflow-x-hidden">
        <StarField />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/app" element={<Dashboard />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/faq" element={<FAQPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
