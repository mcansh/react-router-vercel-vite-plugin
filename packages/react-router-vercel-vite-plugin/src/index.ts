import * as fsp from "node:fs/promises";
import type { Plugin } from "vite";

export type ReactRouterVercelVitePluginOptions = {
  nodeJsRuntime?: `nodejs${number}.x`;
};

export function reactRouterVercelVitePlugin({
  nodeJsRuntime = "nodejs20.x",
}: ReactRouterVercelVitePluginOptions = {}): Plugin {
  return {
    name: "react-router-vercel-vite-plugin",
    enforce: "post",
    apply: "build",
    config(config, env) {
      config.ssr ||= {};
      config.ssr.noExternal = true;
      if (env.isSsrBuild) {
        config.build ||= {};
        config.build.rollupOptions ||= {};
        config.build.rollupOptions.input = "./server/app.ts";
      }
    },

    sharedDuringBuild: true,

    async closeBundle() {
      this.info("Clearing .vercel directory");
      await fsp.rm(".vercel", { recursive: true }).catch(() => {});

      this.info("Creating .vercel/static/output directory");
      this.info("Creating .vercel/output/functions/index.func directory");
      await Promise.all([
        fsp.mkdir(".vercel/output/static", { recursive: true }),
        fsp.mkdir(".vercel/output/functions/index.func", { recursive: true }),
      ]);

      if (await fsp.stat("build/server").catch(() => null)) {
        fsp
          .cp("build/server", ".vercel/output/functions/index.func", {
            recursive: true,
          })
          .then(() => {
            this.info(
              "Copied build/server to .vercel/output/functions/index.func",
            );
          });
      }

      await fsp
        .writeFile(
          ".vercel/output/functions/index.func/package.json",
          JSON.stringify({ type: "module" }),
        )
        .then(() => {
          this.info("Wrote .vercel/output/functions/index.func/index.js");
        });

      await fsp
        .writeFile(
          ".vercel/output/functions/index.func/.vc-config.json",
          JSON.stringify({
            runtime: nodeJsRuntime,
            handler: "index.js",
            launcherType: "Nodejs",
            shouldAddHelpers: true,
          }),
        )
        .then(() => {
          this.info(
            "Wrote .vercel/output/functions/index.func/.vc-config.json",
          );
        });

      await fsp
        .writeFile(
          ".vercel/output/config.json",
          JSON.stringify({
            version: 3,
            routes: [
              { src: "/favicon.ico", dest: "/favicon.ico" },
              {
                src: "/assets/(.*)",
                dest: "/assets/$1",
                headers: {
                  "Cache-Control": "public, max-age=31536000, immutable",
                },
              },
              { src: "/(.*)", dest: "/" },
            ],
          }),
        )
        .then(() => {
          this.info("Wrote .vercel/output/config.json");
        });

      if (await fsp.stat("build/client").catch(() => null)) {
        await fsp
          .cp("build/client", ".vercel/output/static", {
            recursive: true,
          })
          .then(() => {
            this.info("Copied build/client to .vercel/output/static");
          });
      }
    },
  };
}
