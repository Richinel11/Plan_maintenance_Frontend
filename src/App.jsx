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
import DDRDetailPage from './pages/Responsable/DDR/DDRDetailPage';
import DDRValiderPage from './pages/Responsable/DDRdisplay/DDRValiderPage';
import Historique from './pages/Responsable/Historique/Historique';
import ConsultationPage from './pages/Responsable/Consultation/ConsultationPage';
import CcrAccueil from './pages/CCR/Accueil/CcrAccueil';
import TraitementDDR from './pages/CCR/TraitementDDR/TraitementDDR';
import CcrHistorique from './pages/CCR/Historique/Historique';
import CcrDDRActionPage from './pages/CCR/DDRAction/CcrDDRActionPage';
import CcrDDRRefusPage from './pages/CCR/DDRRefus/CcrDDRRefusPage';
import CcrNAPTPage from './pages/CCR/NAPT/CcrNAPTPage';
import CommAccueil from './pages/Communication/Accueil/CommAccueil';
import CommNAPTPage from './pages/Communication/NAPT/CommNAPTPage';
import MesTravaux from './pages/ChargeConsignation/MesTravaux';
import DetailTravail from './pages/ChargeConsignation/DetailTravail';

import KPI from "./pages/G-Plan/KPI/KpiResults";
import GestionnaireHistorique from './pages/G-Plan/Historique/Historique';
import ProtectedRoute from './pages/Security/ProtectedRoute/ProtectedRoute';
function App() {
    return (
        <div className="app-container">
            <Toaster
                position="top-center"
                richColors
                closeButton
                duration={2500}
                visibleToasts={3}
            />
            <Router>
                <Routes>
                    {/* 🔓 Public Routes */}
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/change-password" element={<ChangePassword />} />
                    <Route path="/select-role" element={<SelectRole />} />

                     {/* 🔒 PROTECTED ROUTE WRAPPER */}
                    <Route element={<ProtectedRoute />}>
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
                                <Route path="historique-plan"      element={<GestionnaireHistorique />} />
                                {/* Contenus Responsable d'exploitation */}
                                <Route path='Accueil' element={<Accueil />} />
                                <Route path='Notifications' element={<Notifications />} />
                                <Route path='historique' element={<Historique />} />
                                <Route path='consultation/ddr/:id'  element={<ConsultationPage type="DDR"  />} />
                                <Route path='consultation/napt/:id' element={<ConsultationPage type="NAPT" />} />
                                <Route path='ddr/:ddrId' element={<DDRDetailPage />} />
                                <Route path='ddr/:ddrId/valider' element={<DDRValiderPage />} />

                                {/* Contenus Communication */}
                                <Route path='comm-accueil' element={<CommAccueil />} />
                                <Route path='comm-napt'    element={<CommNAPTPage />} />

                        {/* Contenus Chargé de consignation */}
                        <Route path='charge-consig/travaux'          element={<MesTravaux />} />
                        <Route path='charge-consig/travail/:id'      element={<DetailTravail />} />

                        {/* Contenus CCR */}
                        <Route path='ccr-accueil'        element={<CcrAccueil />} />
                        <Route path='traitement-ddr'     element={<TraitementDDR />} />
                        <Route path='ccr-historique'     element={<CcrHistorique />} />
                        <Route path='ccr/ddr/:ddrId'          element={<CcrDDRActionPage />} />
                        <Route path='ccr/ddr/:ddrId/refuser'  element={<CcrDDRRefusPage />} />
                        <Route path='ccr/napt/:naptId'        element={<CcrNAPTPage />} />
                          {/* Contenu KPI */}
                        <Route path='kpi' element={<KPI />} /></Route>
                           </Route> {/* 🔒 END OF PROTECTED ROUTE WRAPPER */}

                            {/* Catch-all for stray URLs */}
                                <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </Router>
        </div>
    );
}

export default App;
