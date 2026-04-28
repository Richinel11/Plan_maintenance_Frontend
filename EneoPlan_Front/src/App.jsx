import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import ChangePassword from './pages/Login/ChangePassword';
import SelectRole from './pages/Security/SelectRole/SelectRole';
import DashboardLayout from './layouts/DashboardLayout/DashboardLayout';
import DashboardHome from './pages/DashboardHome/DashboardHome';
import UserManagement from './pages/Security/UserManagement/UserManagement';
import RoleManagement from './pages/Security/RoleManagement/RoleManagement';
import PermissionManagement from './pages/Security/PermissionManagement/PermissionManagement';
import WorkflowHistory from './pages/Workflow/WorkflowHistory/WorkflowHistory';
import CreateProcess from './pages/Workflow/WorkflowHistory/createProccess/createProccess';
import CreateGlobalWorkflow from './pages/Workflow/WorkflowHistory/createworkflo/createworkflo';

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
                        <Route path="users" element={<UserManagement />} />
                        <Route path="roles" element={<RoleManagement />} />
                        <Route path="permissions" element={<PermissionManagement />} />
                        {/* Routes Workflow */}
                        <Route path="workflow/historique" element={<WorkflowHistory />} />
                        <Route path="workflow/processus/creer" element={<CreateProcess />} />
                        <Route path="workflow/orchestrateur/creer" element={<CreateGlobalWorkflow />} />
                    </Route>
                </Routes>
            </Router>
        </div>
    );
}

export default App;
