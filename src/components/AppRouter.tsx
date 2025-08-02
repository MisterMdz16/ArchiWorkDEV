import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import SignIn from './SignIn';
import SignUp from './SignUp';
import Dashboard from './Dashboard';
import ProjectsPortfolio from './ProjectsPortfolio';
import ClientsDesigners from './ClientsDesigners';
import MyRequests from './MyRequests';
import Messages from './Messages';
import UsersManagement from './UsersManagement';
import VerificationManagement from './VerificationManagement';
import Analytics from './Analytics';

const AppRouter: React.FC = () => {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading ArchiWork...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show auth pages
  if (!user || !userProfile) {
    return (
      <Router>
        <Routes>
          <Route path="/signup" element={<SignUp onSwitchToSignIn={() => window.location.href = '/signin'} />} />
          <Route path="/signin" element={<SignIn onSwitchToSignUp={() => window.location.href = '/signup'} />} />
          <Route path="*" element={<Navigate to="/signin" replace />} />
        </Routes>
      </Router>
    );
  }

  // If user is authenticated, show main app with routing
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<ProjectsPortfolio />} />
        <Route path="/clients" element={<ClientsDesigners />} />
        <Route path="/requests" element={<MyRequests />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/users" element={<UsersManagement />} />
        <Route path="/verifications" element={<VerificationManagement />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;