import type React from "react";
import { Suspense } from "react";
import { LoadingSpinner } from "./LoadingSpinner";
import { PageTransition } from "./PageTransition";

interface RouteWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RouteWrapper: React.FC<RouteWrapperProps> = ({
  children,
  fallback = <LoadingSpinner fullScreen />,
}) => {
  return (
    <Suspense fallback={fallback}>
      <PageTransition>{children}</PageTransition>
    </Suspense>
  );
};

interface LayoutRouteWrapperProps {
  layout: React.ComponentType<{ children: React.ReactNode }>;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const LayoutRouteWrapper: React.FC<LayoutRouteWrapperProps> = ({
  layout: Layout,
  children,
  fallback = <LoadingSpinner fullScreen />,
}) => {
  return (
    <Layout>
      <Suspense fallback={fallback}>
        <PageTransition>{children}</PageTransition>
      </Suspense>
    </Layout>
  );
};
