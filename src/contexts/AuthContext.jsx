import React, { createContext, useContext, useState, useEffect } from 'react';
import { users, getCurrentUserId, setCurrentUser, clearCurrentUser } from '../services/db';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Check for existing session on mount
    useEffect(() => {
        const checkSession = async () => {
            try {
                const userId = await getCurrentUserId();
                if (userId) {
                    const userData = await users.get(userId);
                    if (userData) {
                        setUser({ id: userData.id, email: userData.email, phone: userData.phone });
                    }
                }
            } catch (err) {
                console.error('Session check error:', err);
            } finally {
                setLoading(false);
            }
        };
        checkSession();
    }, []);

    // Simple hash function (for demo - use bcrypt in production)
    const hashPassword = (password) => {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString();
    };

    // Validate password strength
    const validatePassword = (password) => {
        if (password.length < 6) {
            return 'Password must be at least 6 characters';
        }
        return null;
    };

    // Validate phone number
    const validatePhone = (phone) => {
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phone)) {
            return 'Phone number must be 10 digits';
        }
        return null;
    };

    // Sign up
    const signup = async ({ email, phone, password }) => {
        setError('');

        // Validation
        const passwordError = validatePassword(password);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        const phoneError = validatePhone(phone);
        if (phoneError) {
            setError(phoneError);
            return;
        }

        try {
            // Check if user already exists
            const existingUser = await users.where('email').equals(email).first();
            if (existingUser) {
                setError('User already exists');
                return;
            }

            // Create new user
            const userId = await users.add({
                email,
                phone,
                passwordHash: hashPassword(password),
                createdAt: new Date().toISOString()
            });

            // Set session
            await setCurrentUser(userId);
            setUser({ id: userId, email, phone });
        } catch (err) {
            console.error('Signup error:', err);
            setError('Signup failed. Please try again.');
        }
    };

    // Login
    const login = async (emailOrPhone, password) => {
        setError('');

        try {
            // Find user by email or phone
            let userData = await users.where('email').equals(emailOrPhone).first();

            if (!userData) {
                userData = await users.where('phone').equals(emailOrPhone).first();
            }

            if (!userData) {
                setError('User not found');
                return;
            }

            // Verify password
            if (userData.passwordHash !== hashPassword(password)) {
                setError('Invalid password');
                return;
            }

            // Set session
            await setCurrentUser(userData.id);
            setUser({ id: userData.id, email: userData.email, phone: userData.phone });
        } catch (err) {
            console.error('Login error:', err);
            setError('Login failed. Please try again.');
        }
    };

    // Logout
    const logout = async () => {
        try {
            await clearCurrentUser();
            setUser(null);
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            error,
            signup,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};
