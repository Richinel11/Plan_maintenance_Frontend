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

import OP_home from './pages/op_saisie/Accuiel/Dashboard';
import Planning from './pages/op_saisie/Plannings/Planning';
import Tableaux_De_Bord from './pages/op_saisie/Plannings/TableauxDeBord/Tableaux';
import Creer_Travail from "./pages/op_saisie/Creer_Travail/Nouveau_Travail";
import Dashboard_Plan from './pages/G-Plan/Dashboard/Dashboard';
import Gantt from './pages/G-Plan/Gantt-Diag/Interface';
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

                        {/* Contenus OP-Saisie */}
                        {/* Routes Workflow */}
                        <Route path="workflow/historique" element={<WorkflowHistory />} />
                        <Route path="workflow/processus/creer" element={<CreateProcess />} />
                        <Route path="workflow/orchestrateur/creer" element={<CreateGlobalWorkflow />} />
                        <Route path="OP-home" element={<OP_home />} />
                        <Route path="Planning" element={<Planning />} />
                        <Route path="Tableaux_De_Bord" element={<Tableaux_De_Bord />} />
                        <Route path="CreerTravail" element={<Creer_Travail />} />

                        {/* Contenus pour G-Plan */}
                        <Route path="Dashboard_Plan" element={<Dashboard_Plan />} />
                        <Route path="Gantt" element={<Gantt />} />
                    </Route>
                </Routes>
            </Router>
        </div>
    );
}

export default App;
