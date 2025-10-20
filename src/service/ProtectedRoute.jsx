import { Navigate } from 'react-router-dom';
import TokenAuth from './TokenAuth'; // Adjust the path as needed

function ProtectedRoute({ children, requireAdmin = false }) {
    const { token, isAdmin } = TokenAuth();
    
    // Check if user is authenticated
    const isAuthenticated = !!token;
    
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    // If admin access is required but user is not admin, redirect to unauthorized page or home
    if (requireAdmin && !isAdmin) {
        // You can redirect to an unauthorized page or back to home
        return <Navigate to="/" replace />;
        // Alternatively, you could show an access denied message:
        // return <div>Access Denied - Admin privileges required</div>;
    }
    
    // User is authenticated and meets role requirements
    return children;
}

export default ProtectedRoute;