import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const config = {
    plugins: [
      tailwindcss(),
      react({
        babel: {
          plugins: [["babel-plugin-react-compiler"]],
        },
      }),
    ],
    build: {
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
          },
        },
      },
      cssCodeSplit: true,
      target: "es2020",
    },
  };

  if (command === "build") {
    return {
      ...config,
      base: "/",  // Use absolute paths for domain root deployment
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
