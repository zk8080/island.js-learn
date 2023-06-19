import { CLIENT_ENTRY_PATH, SERVER_ENTRY_PATH } from "./constants/index";
import { build as viteBuild, InlineConfig } from "vite";
import { RollupOutput } from "rollup";
import path from "path";
import fs from "fs-extra";
import { SiteConfig } from "shared/types";
import { createVitePlugins } from "./vitePlugins";
import { Route } from "./plugin-routes";

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
          outDir: isServer ? path.join(root, ".temp") : path.join(root, "build"),
          rollupOptions: {
            input: isServer ? SERVER_ENTRY_PATH : CLIENT_ENTRY_PATH,
            output: {
              format: isServer ? "cjs" : "esm"
            }
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

    return [clientBundle, serverBundle] as [RollupOutput, RollupOutput];
  } catch (e) {
    console.log(e);
  }
}

export async function renderPage(
  render: (pagePath: string) => string,
  routes: Route[],
  root: string,
  clientBundle: RollupOutput
) {
  // 客户端入口chunk文件
  const clientChunk = clientBundle?.output?.find((chunk) => chunk.type === "chunk" && chunk.isEntry);
  await Promise.all(
    routes.map(async (route) => {
      const routePath = route.path;
      // 获取静态HTML内容
      const appHtml = await render(routePath);
      const html = `
  <!DOCTYPE html>
  <html lang="en">
  
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
  </head>
  
  <body>
    <div id="root">${appHtml}</div>
    <script src="/${clientChunk?.fileName}" type="module"></script>
  </body>
  
  </html>
  `.trim();
      const fileName = routePath.endsWith("/") ? `${routePath}index.html` : `${routePath}.html`;
      await fs.ensureDir(path.join(root, "build", path.dirname(fileName)));
      // 将渲染好的html写入到文件中
      await fs.writeFile(path.join(root, "build", fileName), html);
    })
  );

  // 删除服务端文件
  await fs.remove(path.join(root, ".temp"));
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
