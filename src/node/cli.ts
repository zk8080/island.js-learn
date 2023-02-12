import { cac } from "cac";
import path from "path";
import { build } from "./build";

const cli = cac("island").version("0.0.1").help();

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

cli.command("build [root]", "start dev servce").action(async (root) => {
  root = root ? path.resolve(root) : process.cwd();
  await build(root);
});

cli.parse();
