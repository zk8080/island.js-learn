import { routes } from "island:routes";
import { PageData } from "shared/types";
import { matchRoutes } from "react-router-dom";
import siteData from "island:site-data";
import { Layout } from "../theme-default";

export async function initPageData(routePath: string): Promise<PageData> {
  // 获取路由组件编译后的模块内容
  const matched = matchRoutes(routes, routePath);

  if (matched) {
    // Preload route component
    const moduleInfo = await matched[0].route.preload();
    console.log(moduleInfo);
    return {
      pageType: "doc",
      siteData,
      frontmatter: moduleInfo.frontmatter,
      pagePath: routePath
    };
  }
  return {
    pageType: "404",
    siteData,
    pagePath: routePath,
    frontmatter: {}
  };
}

export function App() {
  return <Layout />;
}
