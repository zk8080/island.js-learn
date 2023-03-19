import assert from "assert";
import { MD_REGEX } from "node/constants";
import { Plugin } from "vite";

export function pluginMdxHMR(): Plugin {
  let viteReactPlugin: Plugin;
  return {
    name: "vite-plugin-mdx-hmr",
    apply: "serve",
    configResolved(config) {
      viteReactPlugin = config.plugins.find((plugin) => plugin.name === "vite:react-babel") as Plugin;
    },
    async transform(code, id, options) {
      if (MD_REGEX.test(id)) {
        // Inject babel refresh template code by @vitejs/plugin-react
        assert(typeof viteReactPlugin.transform === "function");

        const result = await viteReactPlugin.transform.call(this, code, id + "?.jsx", options);
        const selfAcceptCode = "import.meta.hot.accept();";
        if (typeof result === "object" && !result!.code?.includes(selfAcceptCode)) {
          result!.code += selfAcceptCode;
        }
        return result;
      }
    }
  };
}
