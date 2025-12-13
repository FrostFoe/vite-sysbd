import type React from "react";
import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { LoadingSpinner, RouteWrapper } from "./components/common";
import DashLayout from "./components/Layout/DashLayout";
import MainLayout from "./components/Layout/MainLayout";
import { useAuth } from "./context/AuthContext";
import { LayoutProvider } from "./context/LayoutContext";

// Lazy load pages for code splitting
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const HomePage = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const ArticleDetail = lazy(() => import("./pages/ArticleDetail"));
const ArticleList = lazy(() => import("./pages/Admin/ArticleList"));
const ArticleEdit = lazy(() => import("./pages/Admin/ArticleEdit"));
const AdminUsers = lazy(() => import("./pages/Admin/Users"));
const AdminUserDetail = lazy(() => import("./pages/Admin/UserDetail"));
const AdminComments = lazy(() => import("./pages/Admin/Comments"));
const AdminCommentDetail = lazy(() => import("./pages/Admin/CommentDetail"));
const AdminSubmissions = lazy(() => import("./pages/Admin/Submissions"));
const AdminSubmissionDetail = lazy(
  () => import("./pages/Admin/SubmissionDetail")
);
const AdminCategories = lazy(() => import("./pages/Admin/Categories"));
const AdminSections = lazy(() => import("./pages/Admin/Sections"));
const AdminDocuments = lazy(() => import("./pages/Admin/Documents"));
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
        {/* Auth pages */}
        <Route
          path="/login"
          element={
            <RouteWrapper>
              <Login />
            </RouteWrapper>
          }
        />
        <Route
          path="/register"
          element={
            <RouteWrapper>
              <Register />
            </RouteWrapper>
          }
        />

        {/* Public routes with MainLayout */}
        <Route
          path="/"
          element={
            <MainLayout>
              <RouteWrapper fallback={<LoadingSpinner />}>
                <HomePage />
              </RouteWrapper>
            </MainLayout>
          }
        />
        <Route
          path="/article/:id"
          element={
            <MainLayout>
              <RouteWrapper fallback={<LoadingSpinner />}>
                <ArticleDetail />
              </RouteWrapper>
            </MainLayout>
          }
        />

        {/* User Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashLayout>
                <RouteWrapper>
                  <Dashboard />
                </RouteWrapper>
              </DashLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin Only Protected Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <DashLayout>
                <RouteWrapper>
                  <AdminDashboard />
                </RouteWrapper>
              </DashLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/articles"
          element={
            <ProtectedRoute adminOnly>
              <DashLayout>
                <RouteWrapper>
                  <ArticleList />
                </RouteWrapper>
              </DashLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/articles/new"
          element={
            <ProtectedRoute adminOnly>
              <DashLayout>
                <RouteWrapper>
                  <ArticleEdit />
                </RouteWrapper>
              </DashLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/articles/:id/edit"
          element={
            <ProtectedRoute adminOnly>
              <DashLayout>
                <RouteWrapper>
                  <ArticleEdit />
                </RouteWrapper>
              </DashLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute adminOnly>
              <DashLayout>
                <RouteWrapper>
                  <AdminUsers />
                </RouteWrapper>
              </DashLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/:userId"
          element={
            <ProtectedRoute adminOnly>
              <DashLayout>
                <RouteWrapper>
                  <AdminUserDetail />
                </RouteWrapper>
              </DashLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/comments"
          element={
            <ProtectedRoute adminOnly>
              <DashLayout>
                <RouteWrapper>
                  <AdminComments />
                </RouteWrapper>
              </DashLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/comments/:commentId"
          element={
            <ProtectedRoute adminOnly>
              <DashLayout>
                <RouteWrapper>
                  <AdminCommentDetail />
                </RouteWrapper>
              </DashLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/submissions"
          element={
            <ProtectedRoute adminOnly>
              <DashLayout>
                <RouteWrapper>
                  <AdminSubmissions />
                </RouteWrapper>
              </DashLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/submissions/:submissionId"
          element={
            <ProtectedRoute adminOnly>
              <DashLayout>
                <RouteWrapper>
                  <AdminSubmissionDetail />
                </RouteWrapper>
              </DashLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute adminOnly>
              <DashLayout>
                <RouteWrapper>
                  <AdminCategories />
                </RouteWrapper>
              </DashLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/sections"
          element={
            <ProtectedRoute adminOnly>
              <DashLayout>
                <RouteWrapper>
                  <AdminSections />
                </RouteWrapper>
              </DashLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/documents"
          element={
            <ProtectedRoute adminOnly>
              <DashLayout>
                <RouteWrapper>
                  <AdminDocuments />
                </RouteWrapper>
              </DashLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch-all for unknown routes */}
        <Route
          path="*"
          element={
            <RouteWrapper>
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-2">404</h1>
                  <p className="text-muted-text">Page not found</p>
                </div>
              </div>
            </RouteWrapper>
          }
        />
      </Routes>
    </LayoutProvider>
  );
};

export default AppRoutes;
