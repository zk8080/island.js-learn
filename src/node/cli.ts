import { cac } from 'cac';
import path = require('path');
import { build } from './build';
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
  .action(async (root) => {
    root = root ? path.resolve(root) : process.cwd();
    await build(root);
  })

cli.parse();