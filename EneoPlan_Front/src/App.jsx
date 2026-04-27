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
import OP_home from './pages/op_saisie/Accuiel/Dashboard';
import Planning from './pages/op_saisie/Plannings/Planning';
import Tableaux_De_Bord from './pages/op_saisie/Plannings/TableauxDeBord/Tableaux';
import Creer_Travail from "./pages/op_saisie/Creer_Travail/Nouveau_Travail";
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
                        <Route path="OP-home" element={<OP_home />} />
                        <Route path="Planning" element={<Planning />} />
                        <Route path="Tableaux_De_Bord" element={<Tableaux_De_Bord />} />
                        <Route path="CreerTravail" element={<Creer_Travail />} />
                    </Route>
                </Routes>
            </Router>
        </div>
    );
}

export default App;
