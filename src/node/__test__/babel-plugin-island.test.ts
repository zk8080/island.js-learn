import { expect, describe, test } from "vitest";
import babelPluginIsland from "../babel-plugin-island";
import os from "os";
import { TransformOptions, transformAsync } from "@babel/core";
import { MASK_SPLITTER } from "../constants/index";

const isWindows = os.platform() === "win32";

describe("babel-plugin-island", () => {
  const ISLAND_PATH = "../Com/index";
  const prefix = isWindows ? "C:" : "";
  const IMPORT_PATH = prefix + "/User/project/test.jsx";
  const babelOptions: TransformOptions = {
    filename: IMPORT_PATH,
    presets: ["@babel/preset-react"],
    plugins: [babelPluginIsland]
  };

  test("Should compile jsx identifier", async () => {
    const code = `import Aside from '${ISLAND_PATH}'; export default function App() { return <Aside __island />; }`;
    const result = await transformAsync(code, babelOptions);
    expect(result.code).toContain(`__island: "${ISLAND_PATH}${MASK_SPLITTER}${IMPORT_PATH}"`);
  });

  test("Should compile jsx member identifier", async () => {
    const code = `import A from '${ISLAND_PATH}'; export default function App() { return <A.B __island />; }`;
    const result = await transformAsync(code, babelOptions);
    expect(result.code).toContain(`__island: "${ISLAND_PATH}${MASK_SPLITTER}${IMPORT_PATH}"`);
  });
});
