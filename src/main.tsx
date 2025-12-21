import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import "./globals.css";
import App from "./App.tsx";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { ToastProvider } from "./components/common/Toast";

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <HelmetProvider>
        <ErrorBoundary>
          <ToastProvider>
            <App />
          </ToastProvider>
        </ErrorBoundary>
      </HelmetProvider>
    </StrictMode>,
  );
} else {
}
