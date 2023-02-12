import { PACKAGE_ROOT } from "./constants/index";
import { createServer as createViteDevServer } from "vite";
import { pluginIndexHtml } from "./plugin-island/indexHtml";
import pluginReact from "@vitejs/plugin-react";
import { resolveConfig } from "./config";
import { pluginConfig } from "./plugin-island/config";

export async function createDevServer(root = process.cwd(), restart: () => Promise<void>) {
  const config = await resolveConfig(root, "serve", "development");
  console.log(config);

  return createViteDevServer({
    plugins: [
      pluginIndexHtml(),
      pluginReact({
        jsxRuntime: "automatic"
      }),
      pluginConfig(config, restart)
    ],
    server: {
      fs: {
        allow: [PACKAGE_ROOT]
      }
    }
  });
}
