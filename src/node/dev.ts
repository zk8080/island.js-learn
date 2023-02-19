import { PACKAGE_ROOT } from "./constants/index";
import { createServer as createViteDevServer } from "vite";
import { resolveConfig } from "./config";
import { createVitePlugins } from "./vitePlugins";

export async function createDevServer(root = process.cwd(), restart: () => Promise<void>) {
  const config = await resolveConfig(root, "serve", "development");

  return createViteDevServer({
    plugins: createVitePlugins(config, restart),
    server: {
      fs: {
        allow: [PACKAGE_ROOT]
      }
    }
  });
}
