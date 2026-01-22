import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { STORAGE_KEYS } from '../utils/constants.js';
import { getCurrentUser } from '../api/auth.api.js';

const AuthContext = createContext(null);

// Auth reducer
const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN_SUCCESS':
            // action.payload may be missing or malformed; guard access
            const userFromPayload = action.payload?.user ?? null;
            return {
                ...state,
                isAuthenticated: !!userFromPayload,
                user: userFromPayload,
                role: userFromPayload?.role ?? null,
                loading: false,
                error: null,
            };
        case 'LOGIN_FAILURE':
            return {
                ...state,
                isAuthenticated: false,
                user: null,
                role: null,
                loading: false,
                error: action.payload,
            };
        case 'LOGOUT':
            return {
                ...state,
                isAuthenticated: false,
                user: null,
                role: null,
                loading: false,
                error: null,
            };
        case 'SET_LOADING':
            return {
                ...state,
                loading: action.payload,
            };
        case 'SET_ERROR':
            return {
                ...state,
                error: action.payload,
                loading: false,
            };
        case 'CLEAR_ERROR':
            return {
                ...state,
                error: null,
            };
        default:
            return state;
    }
};

// Initial state
const initialState = {
    isAuthenticated: false,
    user: null,
    role: null,
    loading: false, // Changed to false to allow immediate public access
    error: null,
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Initialize auth state by checking with backend
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                // Check if user is authenticated by calling /me endpoint
                // Cookies will be automatically sent with the request
                const userData = await getCurrentUser();

                dispatch({
                    type: 'LOGIN_SUCCESS',
                    payload: { user: userData },
                });
            } catch (error) {
                // User not authenticated - this is normal for public access
                // No need to clear anything since we're not using localStorage
                dispatch({
                    type: 'LOGIN_FAILURE',
                    payload: null
                });
            }
        };

        initializeAuth();
    }, []);

    // Login function
    const login = async (user) => {
        try {
            // Backend has already set HTTP-only cookie. Fetch the
            // current user from the backend to ensure we have the
            // authoritative, up-to-date user object (this ensures
            // components like the header update immediately).
            let userData = user ?? null;
            try {
                const fresh = await getCurrentUser();
                // If API returns an envelope, prefer `fresh.user`.
                userData = fresh?.user ?? fresh ?? userData;
            } catch (err) {
                // If fetching fails, fall back to provided `user` value
                // (still better than nothing).
                userData = userData;
            }

            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: { user: userData },
            });
        } catch (error) {
            console.error('Error during login:', error);
            dispatch({
                type: 'LOGIN_FAILURE',
                payload: 'Failed to update authentication state',
            });
        }
    };

    // Logout function
    const logout = () => {
        try {
            // Backend will handle cookie removal
            // Just update the auth state
            dispatch({ type: 'LOGOUT' });
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    // Clear error function
    const clearError = () => {
        dispatch({ type: 'CLEAR_ERROR' });
    };

    // Context value
    const value = {
        ...state,
        login,
        logout,
        clearError,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};