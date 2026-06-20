import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');

  if (!token || !userJson) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userJson);
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // User is authenticated but doesn't have the required role
      // Redirect them to their respective default landing dashboard
      if (user.role === 'ROLE_ADMIN') return <Navigate to="/admin" replace />;
      if (user.role === 'ROLE_DONOR') return <Navigate to="/donor" replace />;
      if (user.role === 'ROLE_NGO') return <Navigate to="/ngo" replace />;
      if (user.role === 'ROLE_VOLUNTEER') return <Navigate to="/volunteer" replace />;
      return <Navigate to="/" replace />;
    }
  } catch (e) {
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
export { ProtectedRoute };
