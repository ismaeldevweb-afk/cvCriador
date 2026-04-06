import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiProxyTarget = env.VITE_API_PROXY_TARGET || "http://localhost:4000";

  return {
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("react-router-dom") || id.includes("/history/")) {
                return "vendor-router";
              }

              if (id.includes("/react/") || id.includes("react-dom") || id.includes("scheduler")) {
                return "vendor-react";
              }
            }

            if (id.includes("/src/templates/") || id.includes("/src/components/ResumePreview.jsx")) {
              return "resume-preview";
            }

            return undefined;
          },
        },
      },
    },
    server: {
      port: 5173,
      proxy: {
        "/api": {
          target: apiProxyTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
