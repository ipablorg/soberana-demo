import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { lingui } from "@lingui/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api/vaults-live': {
        target: 'http://internal-backend.example:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/vaults-live/, ''),
      },
    },
  },
  // Pre-bundle the dialog primitive the lazy detail routes import, so a cold dev
  // server never stalls a route on its first visit (acceptance suite J10).
  optimizeDeps: { include: ['@radix-ui/react-alert-dialog'] },
  plugins: [
    tailwindcss(),
    react({
      babel: {
        plugins: ["@lingui/babel-plugin-lingui-macro"],
      },
    }),
    lingui(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@app": path.resolve(__dirname, "./src/app"),
      "@modules": path.resolve(__dirname, "./src/modules"),
      "@shared": path.resolve(__dirname, "./src/shared"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@styles": path.resolve(__dirname, "./src/styles"),
      
      // Module aliases
      "@suite-user": path.resolve(__dirname, "./src/modules/suite-user"),
      "@suite-backoffice": path.resolve(__dirname, "./src/modules/suite-backoffice"),
      "@common": path.resolve(__dirname, "./src/modules/common"),
    },
    dedupe: ["react", "react-dom"],
  },
  build: {
    sourcemap: mode === "development",
    rollupOptions: {
      // Single entry. The old backoffice.html dual entry duplicated every
      // shared module (auth store, graphql client) across entry graphs: the
      // login page and the protected routes then read DIFFERENT store
      // instances — the QA login ping-pong. The backoffice already lives in
      // this app (routes register SuiteBackofficeRoutes under /backoffice/*)
      // and no server config ever served backoffice.html.
      output: {
        manualChunks(id) {
          // Force backoffice modules into a separate chunk so the
          // customer bundle never loads adminLoopay_ code.
          if (
            id.includes("suite-backoffice") ||
            id.includes("graphql/queries/admin-loopay") ||
            id.includes("graphql/mutations/admin-loopay") ||
            id.includes("graphql/types/admin-loopay")
          ) {
            return "backoffice-shared";
          }

          // Leaf singletons. With a single entry Rollup may otherwise hoist
          // the graphql client into backoffice-shared, which would make the
          // customer pages load the admin chunk. These two modules import no
          // application code, so a dedicated chunk cannot cut an import
          // cycle (the TDZ crash the earlier attempt caused).
          if (
            id.includes("src/shared/lib/graphql-client") ||
            id.includes("src/shared/lib/query-client")
          ) {
            return "shared-infra";
          }

          // Vendor chunks
          if (id.includes("node_modules/react-router")) return "vendor-react-router";
          if (id.includes("node_modules/react-dom") || id.includes("node_modules/react/")) {
            return id.includes("react-dom") ? "vendor-react-dom" : "vendor-react-core";
          }
          if (id.includes("node_modules/@radix-ui")) return "vendor-ui";
          if (id.includes("node_modules/recharts")) return "vendor-charts";
          if (id.includes("node_modules/reactflow")) return "vendor-workflow";
          if (id.includes("node_modules/framer-motion")) return "vendor-animation";
          if (id.includes("node_modules/firebase")) return "vendor-firebase";
        },
      },
    },
  },
}));

