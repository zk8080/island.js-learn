import { App, initPageData } from "./App";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { DataContext } from "./hooks";
import { HelmetProvider } from "react-helmet-async";

export interface RenderResult {
  appHtml: string;
  propsData: unknown[];
  islandToPathMap: Record<string, string>;
}

export async function render(pagePath: string, helmetContext: object) {
  const pageData = await initPageData(pagePath);
  const { clearIslandData, data } = await import("./jsx-runtime");
  clearIslandData();

  const appHtml = renderToString(
    <HelmetProvider context={helmetContext}>
      <DataContext.Provider value={pageData}>
        <StaticRouter location={pagePath}>
          <App />
        </StaticRouter>
      </DataContext.Provider>
    </HelmetProvider>
  );
  // 拿到 islands 组件相关数据
  const { islandProps, islandToPathMap } = data;
  return {
    appHtml,
    propsData: islandProps,
    islandToPathMap
  };
}

// 导出路由数据
export { routes } from "island:routes";
