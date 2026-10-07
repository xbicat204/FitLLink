import { Navigate } from 'react-router-dom';
import { useAuth } from "@/contexts/AuthProvider";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function PrivateRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
