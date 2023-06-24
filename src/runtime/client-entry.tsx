import { createRoot, hydrateRoot } from "react-dom/client";
import { App, initPageData } from "./App";
import { BrowserRouter } from "react-router-dom";
import { DataContext } from "./hooks";
import type { ComponentType } from "react";

declare global {
  interface Window {
    ISLANDS: Record<string, ComponentType<unknown>>;
    ISLAND_PROPS: unknown[];
  }
}

async function renderInBrowser() {
  const containerEl = document.getElementById("root");
  if (!containerEl) {
    throw new Error("#root element not found");
  }
  if (import.meta.env.DEV) {
    // 初始化 PageData
    const pageData = await initPageData(location.pathname);
    createRoot(containerEl).render(
      <BrowserRouter>
        <DataContext.Provider value={pageData}>
          <App />
        </DataContext.Provider>
      </BrowserRouter>
    );
  } else {
    const islands = document.querySelectorAll("[__island]");
    if (islands.length === 0) {
      return;
    }
    for (const island of islands) {
      // Aside:0
      const [id, index] = island.getAttribute("__island").split(":");
      const Element = window.ISLANDS[id] as ComponentType<unknown>;
      hydrateRoot(island, <Element {...window.ISLAND_PROPS[index]} />);
    }
  }
}

renderInBrowser();
