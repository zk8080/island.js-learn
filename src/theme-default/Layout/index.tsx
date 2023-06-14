import { usePageData } from "@runtime";
import "uno.css";
import "../styles/base.css";
import "../styles/vars.css";
import "../styles/doc.css";
import { Nav } from "../components/Nav/index";
import { HomeLayout } from "./HomeLayout";
import { DocLayout } from "./DocLayout/inde";

export function Layout() {
  const pageData = usePageData();
  // 获取 pageType
  const { pageType } = pageData;
  // 根据 pageType 分发不同的页面内容
  const getContent = () => {
    if (pageType === "home") {
      return <HomeLayout></HomeLayout>;
    } else if (pageType === "doc") {
      return <DocLayout></DocLayout>;
    } else {
      return <div>404 页面</div>;
    }
  };
  return (
    <div>
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
