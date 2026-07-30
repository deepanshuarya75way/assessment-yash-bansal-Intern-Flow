import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const normaliseRole = (role) => (role || '').toLowerCase().replace(/\s+/g, '_');

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && user) {
    const rawRole = user.role || user.role_name || '';
    const userRole = normaliseRole(rawRole);
    
    // Admins have access to ALL routes
    const isAdmin = ['admin', 'super_admin'].includes(userRole);
    const isAllowed = isAdmin || allowedRoles.some(r => normaliseRole(r) === userRole);
    
    if (!isAllowed) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
