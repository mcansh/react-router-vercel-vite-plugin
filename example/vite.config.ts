import { reactRouterVercelVitePlugin } from "@mcansh/react-router-vercel-vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
    reactRouterVercelVitePlugin({ nodeJsRuntime: `nodejs22.x` }),
  ],
});
