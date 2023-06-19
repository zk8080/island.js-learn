import { App, initPageData } from "./App";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { DataContext } from "./hooks";

export async function render(pagePath: string) {
  const pageData = await initPageData(pagePath);

  return renderToString(
    <DataContext.Provider value={pageData}>
      <StaticRouter location={pagePath}>
        <App />
      </StaticRouter>
    </DataContext.Provider>
  );
}

// 导出路由数据
export { routes } from "island:routes";
