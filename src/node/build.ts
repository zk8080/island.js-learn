import { CLIENT_ENTRY_PATH, SERVER_ENTRY_PATH } from "./constants/index";
import { build as viteBuild, InlineConfig } from "vite";
import { RollupOutput } from "rollup";
import path from "path";
import fs from "fs-extra";
import { SiteConfig } from "shared/types";
import { createVitePlugins } from "./vitePlugins";

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
          outDir: isServer ? path.join(root, ".temp") : "build",
          rollupOptions: {
            input: isServer ? SERVER_ENTRY_PATH : CLIENT_ENTRY_PATH,
            output: {
              format: isServer ? "cjs" : "esm"
            }
          }
        },
        ssr: {
          noExternal: ["react-router-dom"]
        },
        plugins: await createVitePlugins(config)
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

export async function renderPage(render: () => string, root: string, clientBundle: RollupOutput) {
  // 客户端入口chunk文件
  const clientChunk = clientBundle?.output?.find((chunk) => chunk.type === "chunk" && chunk.isEntry);
  // 获取静态HTML内容
  const appHtml = render();
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
  await fs.ensureDir(path.join(root, "build"));
  // 将渲染好的html写入到文件中
  await fs.writeFile(path.join(root, "build/index.html"), html);
  // 删除服务端文件
  await fs.remove(path.join(root, ".temp"));
}

export async function build(root: string, config: SiteConfig) {
  //1. build -> client + server
  const [clientBundle, serverBundle] = await bundle(root, config);
  //2. 引入server-entry模块
  const serverEntryPath = path.join(root, ".temp", "server-entry.js");
  //3. 服务端渲染，产出HTML
  const { render } = await import(serverEntryPath);
  try {
    await renderPage(render, root, clientBundle);
  } catch (e) {
    console.log("Render page error.\n", e);
  }
}
