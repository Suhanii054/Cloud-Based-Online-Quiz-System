import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Quiz from './pages/Quiz';
import Results from './pages/Results';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background text-primary">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background text-primary">Loading...</div>;
  if (user) return <Navigate to="/home" replace />;
  return children;
};

const AppContent = () => {
  return (
    <Router>
      <div className="min-h-screen bg-background text-textMain flex flex-col font-sans">
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          
          <Route path="/home" element={<ProtectedRoute><Navbar /><Home /></ProtectedRoute>} />
          <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
          <Route path="/results" element={<ProtectedRoute><Navbar /><Results /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Navbar /><Leaderboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Navbar /><Profile /></ProtectedRoute>} />
          
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
