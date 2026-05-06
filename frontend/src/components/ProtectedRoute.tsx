import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/index';

interface Props {
  children: React.ReactNode;
  allowedRole?: UserRole;
}

const ProtectedRoute = ({ children, allowedRole }: Props) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRole && user?.role !== allowedRole) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;