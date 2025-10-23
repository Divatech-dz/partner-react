import { Navigate } from 'react-router-dom';
import TokenAuth from './TokenAuth';

function ProtectedRoute({ children, requireAdmin = false }) {
    const { token, isAdmin } = TokenAuth();
    
    const isAuthenticated = !!token;
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    if (requireAdmin && !isAdmin) {
        return <Navigate to="/" replace />;
    }
    
    return children;
}

export default ProtectedRoute;