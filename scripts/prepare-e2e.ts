import path from "path";
import fs from "fs-extra";
import * as execa from "execa";

const exampleDir = path.resolve(__dirname, "../e2e/playground/basic");

const ROOT = path.resolve(__dirname, "..");

const defaultExecaOpts = {
  stdout: process.stdout,
  stdin: process.stdin,
  stderr: process.stderr
};

async function prepareE2E() {
  if (!fs.existsSync(path.resolve(__dirname, "../dist"))) {
    execa.execaCommandSync("pnpm build", {
      cwd: ROOT
    });
  }

  execa.execaCommandSync("npx playwright install", {
    cwd: ROOT,
    ...defaultExecaOpts
  });

  execa.execaCommandSync("pnpm dev", {
    cwd: exampleDir,
    ...defaultExecaOpts
  });
}

prepareE2E();
