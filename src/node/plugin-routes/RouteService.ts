import FastGlob from "fast-glob";
import { normalizePath } from "vite";
import { relative } from "path";

interface RouteMeta {
  routePath: string;
  absolutePath: string;
}

export class RouteService {
  #scanDir: string;
  #routeData: RouteMeta[] = [];
  constructor(scanDir: string) {
    this.#scanDir = scanDir;
  }

  async init() {
    const files = FastGlob.sync(["**/*.{js,jsx,ts,tsx,md,mdx}"], {
      cwd: this.#scanDir,
      absolute: true,
      ignore: ["**/build/**", "**/.island/**", "**/node_modules/**", "config.ts"]
    }).sort();
    files.forEach((file) => {
      const fileRelativePath = normalizePath(relative(this.#scanDir, file));

      // 路由路径
      const routePath = this.normalizeRoutePath(fileRelativePath);

      this.#routeData.push({
        routePath,
        absolutePath: file
      });
    });
  }

  getRouteMeta(): RouteMeta[] {
    return this.#routeData;
  }

  normalizeRoutePath(rawPath: string) {
    const routePath = rawPath.replace(/\.(.*)?$/, "").replace(/index$/, "");
    return routePath.startsWith("/") ? routePath : `/${routePath}`;
  }

  generateRoutesCode(ssr = false) {
    return `import React from 'react';
    ${ssr ? "" : 'import loadable from "@loadable/component";'}
    ${this.#routeData
      .map((route, index) => {
        return ssr
          ? `import Route${index} from "${route.absolutePath}";`
          : `const Route${index} = loadable(() => import('${route.absolutePath}'));`;
      })
      .join("\n")}
    export const routes = [
    ${this.#routeData
      .map((route, index) => {
        return `{ path: '${route.routePath}', element: React.createElement(Route${index}), preload: () => import('${route.absolutePath}') }`;
      })
      .join(",\n")}
    ];`;
  }
}
