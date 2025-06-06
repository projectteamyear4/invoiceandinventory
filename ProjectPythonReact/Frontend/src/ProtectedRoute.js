import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './components/AuthContext'; // Correct path from src/

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute; // Default export