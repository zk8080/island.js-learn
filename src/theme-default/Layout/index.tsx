import { usePageData } from "@runtime";
import "uno.css";
import "../styles/base.css";
import "../styles/vars.css";
import "../styles/doc.css";
import { Nav } from "../components/Nav/index";
import { HomeLayout } from "./HomeLayout";
import { DocLayout } from "./DocLayout/inde";
import { NotFoundLayout } from "./NotFoundLayout";
import { Helmet } from "react-helmet-async";

export function Layout() {
  const pageData = usePageData();
  // 获取 pageType
  const { pageType, title } = pageData;
  // 根据 pageType 分发不同的页面内容
  const getContent = () => {
    if (pageType === "home") {
      return <HomeLayout></HomeLayout>;
    } else if (pageType === "doc") {
      return <DocLayout></DocLayout>;
    } else {
      return <NotFoundLayout />;
    }
  };
  return (
    <div>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <Nav />
      <section
        style={{
          paddingTop: "var(--island-nav-height)"
        }}
      >
        {" "}
        {getContent()}
      </section>
    </div>
  );
}
