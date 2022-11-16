import { cac } from 'cac';
import path = require('path');
import { createDevServer } from './dev';

const version = require('../../package.json').version;

const cli = cac('island').version(version).help();

cli
  .command("[root]", "start dev servce")
  .alias("dev")
  .action(async (root) => {
    root = root ? path.resolve(root) : process.cwd();
    const server = await createDevServer(root);
    await server.listen();
    server.printUrls();
  })

cli
  .command("build [root]", "start dev servce")
  .action((root) => {
    console.log("build", root);
  })

cli.parse();