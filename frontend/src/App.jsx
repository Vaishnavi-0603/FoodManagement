import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import DonorDashboard from './pages/DonorDashboard';
import NgoDashboard from './pages/NgoDashboard';
import VolunteerDashboard from './pages/VolunteerDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Role-Based Protected Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/donor" 
          element={
            <ProtectedRoute allowedRoles={['ROLE_DONOR']}>
              <DonorDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ngo" 
          element={
            <ProtectedRoute allowedRoles={['ROLE_NGO']}>
              <NgoDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/volunteer" 
          element={
            <ProtectedRoute allowedRoles={['ROLE_VOLUNTEER']}>
              <VolunteerDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Fallback Catch-All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
