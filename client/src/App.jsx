
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './pages/Login';
import DoctorDashboard from './pages/DoctorDashboard';
import WorkerDashboard from './pages/WorkerDashboard';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
};

const App = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/doctor" element={
              <ProtectedRoute role="doctor">
                <DoctorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/worker" element={
              <ProtectedRoute role="worker">
                <WorkerDashboard />
              </ProtectedRoute>
            } />
            {/* Admin is minimal in this demo context, reusing components if needed */}
            <Route path="/admin" element={<div>Admin Dashboard Placeholder</div>} />
          </Routes>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
