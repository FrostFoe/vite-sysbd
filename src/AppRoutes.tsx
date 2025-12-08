import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { LayoutProvider } from "./context/LayoutContext";
import { LoadingSpinner } from "./components/common/LoadingSpinner";
import MainLayout from "./components/Layout/MainLayout";
import DashLayout from "./components/Layout/DashLayout";

// Lazy load pages for code splitting
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const HomePage = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const ArticleDetail = lazy(() => import("./pages/ArticleDetail"));
const ArticleList = lazy(() => import("./pages/Admin/ArticleList"));
const ArticleEdit = lazy(() => import("./pages/Admin/ArticleEdit"));
const AdminInbox = lazy(() => import("./pages/Admin/Inbox"));
const AdminUsers = lazy(() => import("./pages/Admin/Users"));
const AdminComments = lazy(() => import("./pages/Admin/Comments"));
const AdminSubmissions = lazy(() => import("./pages/Admin/Submissions"));
const AdminCategories = lazy(() => import("./pages/Admin/Categories"));
const AdminSections = lazy(() => import("./pages/Admin/Sections"));
const AdminDocuments = lazy(() => import("./pages/Admin/Documents"));
const UserInbox = lazy(() => import("./pages/Dashboard/Inbox"));

// A simple Protected Route wrapper
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  adminOnly?: boolean;
}> = ({ children, adminOnly }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div>Loading authentication...</div>; // Or a spinner component
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== "admin") {
    return <Navigate to="/" replace />; // Redirect non-admins from admin routes
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <LayoutProvider>
      <Routes>
        {/* Routes without MainLayout (e.g., Auth pages) */}
        <Route
          path="/login"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <Login />
            </Suspense>
          }
        />
        <Route
          path="/register"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <Register />
            </Suspense>
          }
        />

        {/* Routes with MainLayout */}
        <Route
          path="/"
          element={
            <MainLayout>
              <Suspense fallback={<LoadingSpinner />}>
                <HomePage />
              </Suspense>
            </MainLayout>
          }
        />
        <Route
          path="/article/:id"
          element={
            <MainLayout>
              <Suspense fallback={<LoadingSpinner />}>
                <ArticleDetail />
              </Suspense>
            </MainLayout>
          }
        />

        {/* User Protected Routes with DashLayout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashLayout>
                <Suspense fallback={<LoadingSpinner />}>
                  <Dashboard />
                </Suspense>
              </DashLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/inbox"
          element={
            <ProtectedRoute>
              <DashLayout>
                <Suspense fallback={<LoadingSpinner />}>
                  <UserInbox />
                </Suspense>
              </DashLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin Only Protected Routes with DashLayout */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <DashLayout>
                <Suspense fallback={<LoadingSpinner />}>
                  <AdminDashboard />
                </Suspense>
              </DashLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/articles"
          element={
            <ProtectedRoute adminOnly>
              <DashLayout>
                <Suspense fallback={<LoadingSpinner />}>
                  <ArticleList />
                </Suspense>
              </DashLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/articles/new"
          element={
            <ProtectedRoute adminOnly>
              <DashLayout>
                <Suspense fallback={<LoadingSpinner />}>
                  <ArticleEdit />
                </Suspense>
              </DashLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/articles/:id/edit"
          element={
            <ProtectedRoute adminOnly>
              <DashLayout>
                <Suspense fallback={<LoadingSpinner />}>
                  <ArticleEdit />
                </Suspense>
              </DashLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/inbox"
          element={
            <ProtectedRoute adminOnly>
              <DashLayout>
                <Suspense fallback={<LoadingSpinner />}>
                  <AdminInbox />
                </Suspense>
              </DashLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute adminOnly>
              <DashLayout>
                <Suspense fallback={<LoadingSpinner />}>
                  <AdminUsers />
                </Suspense>
              </DashLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/comments"
          element={
            <ProtectedRoute adminOnly>
              <DashLayout>
                <Suspense fallback={<LoadingSpinner />}>
                  <AdminComments />
                </Suspense>
              </DashLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/submissions"
          element={
            <ProtectedRoute adminOnly>
              <DashLayout>
                <Suspense fallback={<LoadingSpinner />}>
                  <AdminSubmissions />
                </Suspense>
              </DashLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute adminOnly>
              <DashLayout>
                <Suspense fallback={<LoadingSpinner />}>
                  <AdminCategories />
                </Suspense>
              </DashLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/sections"
          element={
            <ProtectedRoute adminOnly>
              <DashLayout>
                <Suspense fallback={<LoadingSpinner />}>
                  <AdminSections />
                </Suspense>
              </DashLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/documents"
          element={
            <ProtectedRoute adminOnly>
              <DashLayout>
                <Suspense fallback={<LoadingSpinner />}>
                  <AdminDocuments />
                </Suspense>
              </DashLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch-all for unknown routes */}
        <Route
          path="*"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <div>404 Not Found</div>
            </Suspense>
          }
        />
      </Routes>
    </LayoutProvider>
  );
};

export default AppRoutes;
