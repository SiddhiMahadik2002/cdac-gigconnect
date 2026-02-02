import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import MainLayout from '../layouts/MainLayout.jsx';
import ProtectedRoute from '../components/common/ProtectedRoute.jsx';
import Loader from '../components/common/Loader.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import HomePage from '../pages/HomePage.jsx';
import GigListPage from '../pages/GigListPage.jsx';
import GigDetailPage from '../pages/GigDetailPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import FreelancerProfilePage from '../pages/FreelancerProfilePage.jsx';
import FreelancerPublicProfilePage from '../pages/FreelancerPublicProfilePage.jsx';
import FreelancerGigsPage from '../pages/FreelancerGigsPage.jsx';
import CreateGigPage from '../pages/CreateGigPage.jsx';
import EditGigPage from '../pages/EditGigPage.jsx';
import ActiveProjectsPage from '../pages/ActiveProjectsPage.jsx';
import CreateRequirementPage from '../pages/CreateRequirementPage.jsx';
import ClientRequirementsPage from '../pages/ClientRequirementsPage.jsx';
import ClientProjectsPage from '../pages/ClientProjectsPage.jsx';
import BrowseRequirementsPage from '../pages/BrowseRequirementsPage.jsx';
import RequirementProposalsPage from '../pages/RequirementProposalsPage.jsx';
import RequirementDetailPage from '../pages/RequirementDetailPage.jsx';
import MyOrdersPage from '../pages/MyOrdersPage.jsx';
import CompletedWorkPage from '../pages/CompletedWorkPage.jsx';
import OrderSuccessPage from '../pages/OrderSuccessPage.jsx';
import { USER_ROLES } from '../utils/constants.js';

// Layout wrapper component
const LayoutWrapper = () => {
    return (
        <MainLayout>
            <Outlet />
        </MainLayout>
    );
};

const AppRoutes = () => {
    const { isAuthenticated, role, loading } = useAuth();

    // Show loading only for protected routes
    if (loading) {
        return (
            <MainLayout>
                <Loader centered text="Loading..." />
            </MainLayout>
        );
    }

    return (
        <Routes>
            {/* Auth routes without layout */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* All routes with main layout */}
            <Route path="/" element={<LayoutWrapper />}>
                {/* Public routes - accessible to everyone */}
                <Route index element={<HomePage />} />
                <Route path="gigs" element={<GigListPage />} />
                <Route path="gigs/:id" element={<GigDetailPage />} />
                {/* Public freelancer profile (view-only) */}
                <Route path="freelancer/:id" element={<FreelancerPublicProfilePage />} />

                {/* Protected routes for freelancers */}
                <Route path="dashboard" element={
                    <ProtectedRoute requireRole={USER_ROLES.FREELANCER}>
                        <DashboardPage />
                    </ProtectedRoute>
                } />

                <Route path="freelancer/profile" element={
                    <ProtectedRoute requireRole={USER_ROLES.FREELANCER}>
                        <FreelancerProfilePage />
                    </ProtectedRoute>
                } />
                <Route path="freelancer/gigs" element={
                    <ProtectedRoute requireRole={USER_ROLES.FREELANCER}>
                        <FreelancerGigsPage />
                    </ProtectedRoute>
                } />
                <Route path="freelancer/gigs/new" element={
                    <ProtectedRoute requireRole={USER_ROLES.FREELANCER}>
                        <CreateGigPage />
                    </ProtectedRoute>
                } />
                <Route path="freelancer/gigs/edit/:id" element={
                    <ProtectedRoute requireRole={USER_ROLES.FREELANCER}>
                        <EditGigPage />
                    </ProtectedRoute>
                } />

                {/* Active Projects for freelancers */}
                <Route path="freelancer/projects" element={
                    <ProtectedRoute requireRole={USER_ROLES.FREELANCER}>
                        <ActiveProjectsPage />
                    </ProtectedRoute>
                } />

                <Route path="freelancer/completed-work" element={
                    <ProtectedRoute requireRole={USER_ROLES.FREELANCER}>
                        <CompletedWorkPage />
                    </ProtectedRoute>
                } />

                {/* Browse requirements for freelancers */}
                <Route path="requirements" element={
                    <ProtectedRoute requireRole={USER_ROLES.FREELANCER}>
                        <BrowseRequirementsPage />
                    </ProtectedRoute>
                } />

                {/* Protected routes for clients */}
                <Route path="create-requirement" element={
                    <ProtectedRoute requireRole={USER_ROLES.CLIENT}>
                        <CreateRequirementPage />
                    </ProtectedRoute>
                } />
                <Route path="my-requirements" element={
                    <ProtectedRoute requireRole={USER_ROLES.CLIENT}>
                        <ClientRequirementsPage />
                    </ProtectedRoute>
                } />
                <Route path="client/projects" element={
                    <ProtectedRoute requireRole={USER_ROLES.CLIENT}>
                        <ClientProjectsPage />
                    </ProtectedRoute>
                } />
                <Route path="requirements/:requirementId" element={
                    <ProtectedRoute>
                        <RequirementDetailPage />
                    </ProtectedRoute>
                } />
                <Route path="requirements/:requirementId/proposals" element={
                    <ProtectedRoute requireRole={USER_ROLES.CLIENT}>
                        <RequirementProposalsPage />
                    </ProtectedRoute>
                } />

                {/* Order Management Routes */}
                <Route path="my-orders" element={
                    <ProtectedRoute>
                        <MyOrdersPage />
                    </ProtectedRoute>
                } />
                <Route path="orders/success" element={
                    <ProtectedRoute>
                        <OrderSuccessPage />
                    </ProtectedRoute>
                } />

                {/* Legacy route aliases for backward compatibility */}
                <Route path="active-projects" element={
                    <ProtectedRoute>
                        <MyOrdersPage />
                    </ProtectedRoute>
                } />
            </Route>

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;