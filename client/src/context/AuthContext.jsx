
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // ideally check session on load, but Flask uses server-side session cookies.
        // We will assume user is logged out on refresh unless we persist state or have a /me endpoint.
        // The current app.py doesn't have a /me endpoint, so persistence is tricky without changing backend.
        // We will use localStorage to persist basic role info for UI, but API will fail if cookie dies.
        const storedRole = localStorage.getItem('userRole');
        if (storedRole) {
            setUser({ role: storedRole });
        }
        setLoading(false);
    }, []);

    const login = async (phone) => {
        try {
            const res = await api.post('/login', { phone });
            setUser({ role: res.data.role });
            localStorage.setItem('userRole', res.data.role);
            return { success: true, role: res.data.role };
        } catch (error) {
            return { success: false, error: 'Login failed' };
        }
    };

    const signup = async (userData) => {
        try {
            const res = await api.post('/signup', userData);
            if (res.data.health_id) {
                // Worker auto-login
                setUser({ role: 'worker' });
                localStorage.setItem('userRole', 'worker');
            }
            // Admin doesn't auto-login usually but this flow might differ.
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Registration failed' };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('userRole');
        // Optional: call backend logout if exists (not in current app.py)
        window.location.href = '/';
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
