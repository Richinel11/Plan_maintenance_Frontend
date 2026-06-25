import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';

const ProtectedRoute = () => {
    const location = useLocation();
    
    // 🔑 READ THE CORRECT COOKIE KEY NAME: 'accessToken'
    const token = Cookies.get('accessToken');
    
    const activeRole = Cookies.get('activeRole');

    console.log("--- Guard Check ---");
    console.log("Pathname:", location.pathname);
    console.log("Token Present:", !!token);
    console.log("Active Role:", activeRole);

    if (token && activeRole) {
        return <Outlet />;
    }

    if (token && !activeRole) {
        if (location.pathname === '/select-role') {
            return <Outlet />;
        }
        return <Navigate to="/select-role" replace />;
    }

    return <Navigate to="/login" replace />;
};

export default ProtectedRoute;