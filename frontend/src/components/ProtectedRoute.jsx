import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to appropriate dashboard based on role if access denied
  const getDefaultRoute = (role) => {
    if (role === 'admin') return '/admin';
    if (role === 'verification_officer') return '/verification';
    return '/dashboard';
  };

  // Check if user has required role or is in allowed roles
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={getDefaultRoute(user.role)} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDefaultRoute(user.role)} replace />;
  }

  return children;
};

export default ProtectedRoute;

