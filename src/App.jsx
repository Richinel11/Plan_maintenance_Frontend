import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import './styles/toasts.css';
import Login from './pages/Login/Login';
import ChangePassword from './pages/Login/ChangePassword';
import SelectRole from './pages/Security/SelectRole/SelectRole';
import DashboardLayout from './layouts/DashboardLayout/DashboardLayout';
import DashboardHome from './pages/DashboardHome/DashboardHome';
import UserManagement from './pages/Security/UserManagement/UserManagement';
import RoleManagement from './pages/Security/RoleManagement/RoleManagement';
import PermissionManagement from './pages/Security/PermissionManagement/PermissionManagement';
import WorkflowHistory from './pages/Workflow/WorkflowHistory/WorkflowHistory';
import CreateGlobalWorkflow from './pages/Workflow/WorkflowHistory/createworkflo/createworkflo';
import WorkflowDetail from './pages/Workflow/WorkflowHistory/WorkflowDetail/WorkflowDetail';
import PlanningAudit from './pages/Workflow/PlanningAudit';
import PlanningWorkflowDetail from './pages/Workflow/PlanningWorkflowDetail';

import OP_home from './pages/op_saisie/Accuiel/Dashboard';
import Planning from './pages/op_saisie/Plannings/Planning';
import Creer_Travail from "./pages/op_saisie/Creer_Travail/Nouveau_Travail";
import Dashboard_Plan from './pages/G-Plan/Dashboard/Dashboard';
import Calendar from './pages/G-Plan/Calendar/CalendarView';
import AdvancedGantt from './pages/G-Plan/Gantt-Diag/details/AdvancedGantt';
import ReajustementAvance from './pages/G-Plan/Gantt-Diag/details/ReajustementAvance';
import AlertesView from './pages/G-Plan/Alertes/AlertesView';

import Accueil from './pages/Responsable/Accueil/accueil';
import Notifications from './pages/Responsable/Planning/Notifications';
function App() {
    return (
        <div className="app-container">
            <Toaster
                position="top-center"
                richColors
                closeButton
            />
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
                        <Route path="workflow/:id" element={<WorkflowDetail />} />
                        <Route path="workflow/Workflow/creer" element={<CreateGlobalWorkflow />} />
                        <Route path="planning-audit" element={<PlanningAudit />} />
                        <Route path="planning-audit/:planningId" element={<PlanningWorkflowDetail />} />

                        {/* Contenus OP-Saisie */}
                        <Route path="OP-home" element={<OP_home />} />
                        <Route path="Planning" element={<Planning />} />
                        <Route path="Planning/:id" element={<Planning />} />
                        <Route path="CreerTravail" element={<Creer_Travail />} />

                        {/* Contenus pour G-Plan */}
                        <Route path="dashboard-plan"       element={<Dashboard_Plan />} />
                        <Route path="Calendar"             element={<Calendar />} />
                        <Route path="alertes"              element={<AlertesView />} />
                        <Route path="advanced-gantt"       element={<AdvancedGantt />} />
                        <Route path="reajustement-avance"  element={<ReajustementAvance />} />
                        {/* new */}
                        <Route path="Planning/:id" element={<Planning />}/>
                        <Route path="Tableaux_De_Bord" element={<Tableaux_De_Bord />} />
                        <Route path="CreerTravail" element={<Creer_Travail />} />

                        {/* Contenus pour G-Plan */}
                        <Route path="Dashboard_Plan" element={<Dashboard_Plan />} />
                        <Route path="Gantt" element={<Gantt />} />
                        <Route path="Calendar" element={<Calendar />} />

                        {/* Contenus Responsable d'exploitation */}
                        <Route path='Accueil' element={<Accueil />} />
                        <Route path='Notifications' element={<Notifications />} />
                    </Route>
                </Routes>
            </Router>
        </div>
    );
}

export default App;
