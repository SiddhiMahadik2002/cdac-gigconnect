import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { USER_ROLES } from '../../utils/constants.js';
import Loader from './Loader.jsx';

const ProtectedRoute = ({
    children,
    requireRole = null,
    redirectTo = '/login'
}) => {
    const { isAuthenticated, role, loading } = useAuth();
    const location = useLocation();

    // Show loader while auth is being initialized (very briefly)
    if (loading) {
        return <Loader centered text="Checking authentication..." />;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate
            to={redirectTo}
            state={{ from: location }}
            replace
        />;
    }

    // Check role requirement
    if (requireRole && role !== requireRole) {
        // Redirect to home page if wrong role
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;