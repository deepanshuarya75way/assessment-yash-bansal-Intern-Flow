import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import UnauthorizedPage from './pages/auth/UnauthorizedPage';
import ProfilePage from './pages/profile/ProfilePage';
import PortfolioPage from './pages/portfolio/PortfolioPage';
import ProjectsPage from './pages/projects/ProjectsPage';
import ProjectDetailsPage from './pages/projects/ProjectDetailsPage';
import KanbanBoard from './pages/tasks/KanbanBoard';
import InternshipDashboard from './pages/internships/InternshipDashboard';
import SkillGraph from './pages/growth/SkillGraph';
import PlacementDashboard from './pages/placement/PlacementDashboard';
import AnalyticsDashboard from './pages/analytics/AnalyticsDashboard';
import DashboardPage from './pages/dashboard/DashboardPage';

const NotFound = () => (
  <div style={{ padding: '40px', textAlign: 'center' }}>
    <h2>404 Page Not Found</h2>
    <p>The page you are looking for does not exist.</p>
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/portfolio/:uuid" element={<PortfolioPage />} />
      
      {/* Protected Layout Routes */}
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        {/* All authenticated roles can access Dashboard and Profile */}
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="unauthorized" element={<UnauthorizedPage />} />
        
        {/* Projects & Tasks: Admin, Mentor, Student, Team Lead, Placement Coordinator */}
        <Route path="projects" element={
          <ProtectedRoute allowedRoles={['admin', 'mentor', 'student', 'team_lead', 'placement_coordinator']}>
            <ProjectsPage />
          </ProtectedRoute>
        } />
        <Route path="projects/:id" element={
          <ProtectedRoute allowedRoles={['admin', 'mentor', 'student', 'team_lead', 'placement_coordinator']}>
            <ProjectDetailsPage />
          </ProtectedRoute>
        } />
        <Route path="projects/:projectId/kanban" element={
          <ProtectedRoute allowedRoles={['admin', 'mentor', 'student', 'team_lead', 'placement_coordinator']}>
            <KanbanBoard />
          </ProtectedRoute>
        } />
        <Route path="tasks" element={
          <ProtectedRoute allowedRoles={['admin', 'mentor', 'student', 'team_lead', 'placement_coordinator']}>
            <KanbanBoard />
          </ProtectedRoute>
        } />
        
        {/* Internship: Admin, Mentor, Student, Placement Coordinator */}
        <Route path="internship" element={
          <ProtectedRoute allowedRoles={['admin', 'mentor', 'student', 'placement_coordinator']}>
            <InternshipDashboard />
          </ProtectedRoute>
        } />
        
        {/* Analytics (Growth): Admin, Mentor, Student, Placement Coordinator */}
        <Route path="analytics" element={
          <ProtectedRoute allowedRoles={['admin', 'mentor', 'student', 'placement_coordinator']}>
            <SkillGraph />
          </ProtectedRoute>
        } />
        
        {/* Placement: Admin, Student, Placement Coordinator */}
        <Route path="placement" element={
          <ProtectedRoute allowedRoles={['admin', 'student', 'placement_coordinator']}>
            <PlacementDashboard />
          </ProtectedRoute>
        } />
        
        {/* Reports: Admin, Mentor, Team Lead, Placement Coordinator */}
        <Route path="reports" element={
          <ProtectedRoute allowedRoles={['admin', 'mentor', 'team_lead', 'placement_coordinator']}>
            <AnalyticsDashboard />
          </ProtectedRoute>
        } />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
