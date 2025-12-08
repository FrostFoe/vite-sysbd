import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { LayoutProvider } from "./context/LayoutContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MainLayout from "./components/Layout/MainLayout"; // Import MainLayout

import HomePage from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ArticleDetail from "./pages/ArticleDetail";
import ArticleList from "./pages/Admin/ArticleList";
import ArticleEdit from "./pages/Admin/ArticleEdit"; // Assuming this component is created
import AdminInbox from "./pages/Admin/Inbox";
import AdminUsers from "./pages/Admin/Users";
import AdminComments from "./pages/Admin/Comments";
import AdminSubmissions from "./pages/Admin/Submissions";
import UserInbox from "./pages/Dashboard/Inbox";

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
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Routes with MainLayout */}
        <Route
          path="/"
          element={
            <MainLayout>
              <HomePage />
            </MainLayout>
          }
        />
        <Route
          path="/article/:id"
          element={
            <MainLayout>
              <ArticleDetail />
            </MainLayout>
          }
        />

        {/* User Protected Routes with MainLayout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/inbox"
          element={
            <ProtectedRoute>
              <MainLayout>
                <UserInbox />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin Only Protected Routes with MainLayout */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <MainLayout>
                <AdminDashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/articles"
          element={
            <ProtectedRoute adminOnly>
              <MainLayout>
                <ArticleList />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/articles/new"
          element={
            <ProtectedRoute adminOnly>
              <MainLayout>
                <ArticleEdit />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/articles/:id/edit"
          element={
            <ProtectedRoute adminOnly>
              <MainLayout>
                <ArticleEdit />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/inbox"
          element={
            <ProtectedRoute adminOnly>
              <MainLayout>
                <AdminInbox />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute adminOnly>
              <MainLayout>
                <AdminUsers />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/comments"
          element={
            <ProtectedRoute adminOnly>
              <MainLayout>
                <AdminComments />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/submissions"
          element={
            <ProtectedRoute adminOnly>
              <MainLayout>
                <AdminSubmissions />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch-all for unknown routes */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </LayoutProvider>
  );
};

export default AppRoutes;
