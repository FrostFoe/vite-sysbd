import type React from "react";
import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { PageTransition } from "./components/common/PageTransition";
import { LoadingSpinner } from "./components/common/LoadingSpinner";
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
        {/* Auth pages with animations */}
        <Route
          path="/login"
          element={
            <Suspense fallback={<LoadingSpinner fullScreen />}>
              <PageTransition>
                <Login />
              </PageTransition>
            </Suspense>
          }
        />
        <Route
          path="/register"
          element={
            <Suspense fallback={<LoadingSpinner fullScreen />}>
              <PageTransition>
                <Register />
              </PageTransition>
            </Suspense>
          }
        />

        {/* Routes with MainLayout */}
        <Route
          path="/"
          element={
            <MainLayout>
              <Suspense fallback={<LoadingSpinner />}>
                <PageTransition>
                  <HomePage />
                </PageTransition>
              </Suspense>
            </MainLayout>
          }
        />
        <Route
          path="/article/:id"
          element={
            <MainLayout>
              <Suspense fallback={<LoadingSpinner />}>
                <PageTransition>
                  <ArticleDetail />
                </PageTransition>
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
                <Suspense fallback={<LoadingSpinner fullScreen />}>
                  <PageTransition>
                    <Dashboard />
                  </PageTransition>
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
                <Suspense fallback={<LoadingSpinner fullScreen />}>
                  <PageTransition>
                    <AdminDashboard />
                  </PageTransition>
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
                <Suspense fallback={<LoadingSpinner fullScreen />}>
                  <PageTransition>
                    <ArticleList />
                  </PageTransition>
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
                <Suspense fallback={<LoadingSpinner fullScreen />}>
                  <PageTransition>
                    <ArticleEdit />
                  </PageTransition>
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
                <Suspense fallback={<LoadingSpinner fullScreen />}>
                  <PageTransition>
                    <ArticleEdit />
                  </PageTransition>
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
                <Suspense fallback={<LoadingSpinner fullScreen />}>
                  <PageTransition>
                    <AdminUsers />
                  </PageTransition>
                </Suspense>
              </DashLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/:userId"
          element={
            <ProtectedRoute adminOnly>
              <DashLayout>
                <Suspense fallback={<LoadingSpinner fullScreen />}>
                  <PageTransition>
                    <AdminUserDetail />
                  </PageTransition>
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
                <Suspense fallback={<LoadingSpinner fullScreen />}>
                  <PageTransition>
                    <AdminComments />
                  </PageTransition>
                </Suspense>
              </DashLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/comments/:commentId"
          element={
            <ProtectedRoute adminOnly>
              <DashLayout>
                <Suspense fallback={<LoadingSpinner fullScreen />}>
                  <PageTransition>
                    <AdminCommentDetail />
                  </PageTransition>
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
                <Suspense fallback={<LoadingSpinner fullScreen />}>
                  <PageTransition>
                    <AdminSubmissions />
                  </PageTransition>
                </Suspense>
              </DashLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/submissions/:submissionId"
          element={
            <ProtectedRoute adminOnly>
              <DashLayout>
                <Suspense fallback={<LoadingSpinner fullScreen />}>
                  <PageTransition>
                    <AdminSubmissionDetail />
                  </PageTransition>
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
                <Suspense fallback={<LoadingSpinner fullScreen />}>
                  <PageTransition>
                    <AdminCategories />
                  </PageTransition>
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
                <Suspense fallback={<LoadingSpinner fullScreen />}>
                  <PageTransition>
                    <AdminSections />
                  </PageTransition>
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
                <Suspense fallback={<LoadingSpinner fullScreen />}>
                  <PageTransition>
                    <AdminDocuments />
                  </PageTransition>
                </Suspense>
              </DashLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch-all for unknown routes */}
        <Route
          path="*"
          element={
            <Suspense fallback={<LoadingSpinner fullScreen />}>
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-2">404</h1>
                  <p className="text-muted-text">Page not found</p>
                </div>
              </div>
            </Suspense>
          }
        />
      </Routes>
    </LayoutProvider>
  );
};

export default AppRoutes;
