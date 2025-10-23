// TokenAuth.js
import {jwtDecode} from 'jwt-decode';

export default function TokenAuth() {
    const token = localStorage.getItem("token") || null;
    let isAdmin = false;
    let decoded;
    let username;
    let userId;
    let userRole;
    let commercial;
    if (typeof token !== 'string' || !token) {
        return { isAdmin, token: null, username: null, userId: null, userRole: null , commercial: null };
    }

    try {
        decoded = jwtDecode(token);
        username = decoded.user?.username || null;
        userId = decoded.user?.id || null;
        userRole = decoded.user?.groups?.[0]?.name || 'client';
        commercial = decoded.user?.commercial || null;   
        if (decoded.exp && decoded.exp < Date.now() / 1000) {
            console.error("Token expired.");
            localStorage.removeItem("token");
            return { isAdmin, token: null, username: null, userId: null, userRole: null };
        }

        if (userRole === "Admin") {
            isAdmin = true;
        }

    } catch (error) {
        console.error("Invalid token:", error.message);
        localStorage.removeItem("token");
        return { isAdmin, token: null, username: null, userId: null, userRole: null };
    }
    
    return { isAdmin, token, username, userId, userRole , commercial };
}