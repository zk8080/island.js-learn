import { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { Element, Root } from "hast";

export const rehypePluginPreWrapper: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, "element", (node) => {
      if (
        node.tagName === "pre" &&
        node.children[0]?.type === "element" &&
        node.children[0]?.tagName === "code" &&
        // 通过自定义标识来判断是否已经构造过该节点
        !node.data?.isVisited
      ) {
        const codeNode = node.children[0];
        const codeClassName = codeNode.properties?.className?.toString() || ""; // language-js

        const lang = codeClassName?.split("-")[1]; // js

        // clone 原始code节点
        const cloneNode: Element = {
          type: "element",
          tagName: "pre",
          children: node.children,
          data: {
            isVisited: true
          }
        };

        // 修改原来的标签： pre -> div
        node.tagName = "div";
        node.properties = node.properties || {};
        node.properties.className = codeClassName;

        // 构造div标签的子节点
        node.children = [
          {
            type: "element",
            tagName: "span",
            properties: {
              className: "lang"
            },
            children: [
              {
                type: "text",
                value: lang
              }
            ]
          },
          cloneNode
        ];
      }
    });
  };
};
