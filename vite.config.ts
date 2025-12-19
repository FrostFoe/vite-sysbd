import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(({ command }) => {
  // biome-ignore lint/suspicious/noExplicitAny: buildConfig needs any for flexibility with Rollup types
  const buildConfig: any = {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes("node_modules")) {
            if (id.includes("@tiptap")) {
              return "vendor-tiptap";
            }
            if (id.includes("lucide-react")) {
              return "vendor-ui";
            }
            if (id.includes("axios")) {
              return "vendor-utils";
            }
            if (id.includes("react") || id.includes("react-router")) {
              return "vendor-react";
            }
            return "vendor";
          }

          if (id.includes("/pages/")) {
            const match = id.match(/\/pages\/([^/]+)/);
            if (match) {
              return `page-${match[1]}`;
            }
          }

          if (id.includes("/components/")) {
            const match = id.match(/\/components\/([^/]+)/);
            if (match) {
              return `component-${match[1]}`;
            }
          }
        },
      },
    },
    cssCodeSplit: true,
    target: "es2020",
  };

  const config = {
    plugins: [
      tailwindcss(),
      react({
        babel: {
          plugins: [["babel-plugin-react-compiler"]],
        },
      }),
    ],
    build: buildConfig,
  };

  if (command === "build") {
    return {
      ...config,
      base: "/",
    };
  } else {
    return {
      ...config,
      server: {
        proxy: {
          "/api": {
            target: "http://localhost:8000",
            changeOrigin: true,
          },
          "/assets": {
            target: "http://localhost:8000",
            changeOrigin: true,
          },
        },
      },
    };
  }
});
