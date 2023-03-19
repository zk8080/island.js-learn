import { Plugin } from "vite";
import { pluginMdxHMR } from "./pluginMdxHmr";
import { pluginMdxRollup } from "./pluginMdxRollup";

export async function createPluginMdx(): Promise<Plugin[]> {
  return [await pluginMdxRollup(), pluginMdxHMR()];
}
