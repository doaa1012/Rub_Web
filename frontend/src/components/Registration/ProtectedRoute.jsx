import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../components/AuthContext';  // Import the auth context

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // If the user is not authenticated, redirect to the login page
    return <Navigate to="/login" />;
  }

  // Otherwise, render the protected content
  return children;
};

export default ProtectedRoute;

