import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import ChangePassword from './pages/Login/ChangePassword';
import SelectRole from './pages/SelectRole/SelectRole';
import DashboardLayout from './layouts/DashboardLayout/DashboardLayout';
import DashboardHome from './pages/DashboardHome/DashboardHome';


function App() {
    return (
        <div className="app-container">
            <Router>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/change-password" element={<ChangePassword />} />
                    <Route path="/select-role" element={<SelectRole />} />

                    {/* Dashboard Routes Protegées */}
                    <Route path="/dashboard" element={<DashboardLayout />}>
                        <Route index element={<Navigate to="home" replace />} />
                        <Route path="home" element={<DashboardHome />} />
                    </Route>
                </Routes>
            </Router>
        </div>
    );
}

export default App;
