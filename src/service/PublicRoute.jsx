import { Navigate } from 'react-router-dom';
import TokenAuth from './TokenAuth';

function PublicRoute({ children }) {
    const { token } = TokenAuth();
    
    if (token) {
        return <Navigate to="/" replace />;
    }
    
    return children;
}

export default PublicRoute;