import {jwtDecode} from 'jwt-decode';

export default function TokenAuth() {
    const token = localStorage.getItem("token") || null;
    let isAdmin = false;
    let decoded;
    let username;

    if (typeof token !== 'string') {
        return { isAdmin, token: null };
    }

    try {
        decoded = jwtDecode(token);
        username = decoded.user.username || null;

        if (decoded.exp && decoded.exp < Date.now() / 1000) {
            console.error("Token expired.");
            localStorage.removeItem("token");
            return { isAdmin, token: null };
        }

        if (decoded.user.groups[0].name === "Admin") {
            isAdmin = true;
        }

    } catch (error) {
        console.error("Invalid token:", error.message);
        return { isAdmin, token: null };
    }
    return { isAdmin, token, username };
}