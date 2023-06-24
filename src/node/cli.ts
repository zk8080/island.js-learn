import { cac } from "cac";
import path from "path";
import { build } from "./build";
import { resolveConfig } from "./config";
import { preview } from "./preview";

const cli = cac("island-learn").version("0.0.1").help();

cli
  .command("[root]", "start dev servce")
  .alias("dev")
  .action(async (root) => {
    root = root ? path.resolve(root) : process.cwd();
    const createServer = async () => {
      const { createDevServer } = await import("./dev.js");
      const server = await createDevServer(root, async () => {
        await server.close();
        await createServer();
      });
      await server.listen();
      server.printUrls();
    };
    await createServer();
  });

cli.command("build [root]", "start build servce").action(async (root) => {
  root = root ? path.resolve(root) : process.cwd();
  const config = await resolveConfig(root, "build", "production");
  await build(root, config);
});

cli
  .command("preview [root]", "start preview servce")
  .option("--port <port>", "port to use for preview server")
  .action(async (root, { port }: { port: number }) => {
    root = root ? path.resolve(root) : process.cwd();
    await preview(root, { port });
  });

cli.parse();
