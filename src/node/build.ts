import { CLIENT_ENTRY_PATH, MASK_SPLITTER, PACKAGE_ROOT, SERVER_ENTRY_PATH, EXTERNALS } from "./constants/index";
import { build as viteBuild, InlineConfig } from "vite";
import type { RollupOutput } from "rollup";
import path from "path";
import fs from "fs-extra";
import type { SiteConfig } from "shared/types";
import { createVitePlugins } from "./vitePlugins";
import { Route } from "./plugin-routes";
import type { RenderResult } from "runtime/server-entry";
import type { HelmetData } from "react-helmet-async";

const CLIENT_OUTPUT = "build";
const normalizeVendorFilename = (fileName: string) => fileName.replace(/\//g, "_") + ".js";
// 打包
export async function bundle(root: string, config: SiteConfig) {
  try {
    const resolveViteConfig = async (isServer: boolean): Promise<InlineConfig> => {
      return {
        mode: "production",
        root,
        build: {
          minify: false,
          ssr: isServer,
          outDir: isServer ? path.join(root, ".temp") : path.join(root, CLIENT_OUTPUT),
          rollupOptions: {
            input: isServer ? SERVER_ENTRY_PATH : CLIENT_ENTRY_PATH,
            output: {
              format: isServer ? "cjs" : "esm"
            },
            external: EXTERNALS
          }
        },
        ssr: {
          noExternal: ["react-router-dom", "lodash-es"]
        },
        plugins: await createVitePlugins(config, undefined, isServer)
      };
    };
    const clientBuild = async () => {
      return viteBuild(await resolveViteConfig(false));
    };
    const serverBuild = async () => {
      return viteBuild(await resolveViteConfig(true));
    };
    // 构建客户端和服务端
    const [clientBundle, serverBundle] = await Promise.all([clientBuild(), serverBuild()]);
    const publicDir = path.join(root, "public");
    if (fs.pathExistsSync(publicDir)) {
      await fs.copy(publicDir, path.join(root, CLIENT_OUTPUT));
    }
    await fs.copy(path.join(PACKAGE_ROOT, "vendors"), path.join(root, CLIENT_OUTPUT));
    return [clientBundle, serverBundle] as [RollupOutput, RollupOutput];
  } catch (e) {
    console.log(e);
  }
}

async function buildIslands(root: string, islandPathToMap: Record<string, string>) {
  // 根据 islandPathToMap 拼接模块代码内容
  const islandsInjectCode = `
    ${Object.entries(islandPathToMap)
      .map(([islandName, islandPath]) => `import { ${islandName} } from '${islandPath}';`)
      .join("")}
window.ISLANDS = { ${Object.keys(islandPathToMap).join(", ")} };
window.ISLAND_PROPS = JSON.parse(
 document.getElementById('island-props').textContent
);
 `;
  const injectId = "island:inject";
  return viteBuild({
    mode: "production",
    esbuild: {
      jsx: "automatic"
    },
    build: {
      outDir: path.join(root, ".temp"),
      rollupOptions: {
        input: injectId,
        external: EXTERNALS
      }
    },
    plugins: [
      // 重点插件，用来加载我们拼接的 Islands 注册模块的代码
      {
        name: injectId,
        enforce: "post",
        resolveId(id) {
          if (id.includes(MASK_SPLITTER)) {
            const [originId, importer] = id.split(MASK_SPLITTER);
            return this.resolve(originId, importer, { skipSelf: true });
          }

          if (id === injectId) {
            return id;
          }
        },
        load(id) {
          if (id === injectId) {
            return islandsInjectCode;
          }
        },
        // 对于 Islands Bundle，我们只需要 JS 即可，其它资源文件可以删除
        generateBundle(_, bundle) {
          for (const name in bundle) {
            if (bundle[name].type === "asset") {
              delete bundle[name];
            }
          }
        }
      }
    ]
  });
}

export async function renderPage(
  render: (pagePath: string, helmetContext: object) => RenderResult,
  routes: Route[],
  root: string,
  clientBundle: RollupOutput
) {
  // 客户端入口chunk文件
  const clientChunk = clientBundle?.output?.find((chunk) => chunk.type === "chunk" && chunk.isEntry);
  await Promise.all(
    routes.map(async (route) => {
      const routePath = route.path;
      const helmetContext = {
        context: {}
      } as HelmetData;
      // 获取静态HTML内容
      const { appHtml, islandToPathMap, propsData = [] } = await render(routePath, helmetContext.context);
      const styleAssets = clientBundle.output.filter(
        (chunk) => chunk.type === "asset" && chunk.fileName.endsWith(".css")
      );
      const islandBundle = await buildIslands(root, islandToPathMap);
      const islandsCode = (islandBundle as RollupOutput).output[0].code;
      const { helmet } = helmetContext.context;

      const html = `
  <!DOCTYPE html>
  <html lang="en">
  
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${helmet?.title?.toString() || ""}
    ${helmet?.meta?.toString() || ""}
    ${helmet?.link?.toString() || ""}
    ${helmet?.style?.toString() || ""}
    ${styleAssets.map((item) => `<link rel="stylesheet" href="/${item.fileName}" />`).join("\n")}
    <script type="importmap">
    {
      "imports": {
        ${EXTERNALS.map((name) => `"${name}": "/${normalizeVendorFilename(name)}"`).join(",")}
      }
    }
  </script>
  </head>
  <body>
    <div id="root">${appHtml}</div>
    <script type="module">${islandsCode}</script>
    <script type="module" src="/${clientChunk?.fileName}"></script>
    <script id="island-props">${JSON.stringify(propsData)}</script>
  </body>
  
  </html>
  `.trim();
      const fileName = routePath.endsWith("/") ? `${routePath}index.html` : `${routePath}.html`;
      await fs.ensureDir(path.join(root, "build", path.dirname(fileName)));
      // 将渲染好的html写入到文件中
      await fs.writeFile(path.join(root, "build", fileName), html);
    })
  );

  // // 删除服务端文件
  // await fs.remove(path.join(root, ".temp"));
}

export async function build(root: string, config: SiteConfig) {
  //1. build -> client + server
  const [clientBundle, serverBundle] = await bundle(root, config);
  //2. 引入server-entry模块
  const serverEntryPath = path.join(root, ".temp", "server-entry.js");
  //3. 服务端渲染，产出HTML, 拿到 routes 数组
  const { render, routes } = await import(serverEntryPath);
  try {
    await renderPage(render, routes, root, clientBundle);
  } catch (e) {
    console.log("Render page error.\n", e);
  }
}
