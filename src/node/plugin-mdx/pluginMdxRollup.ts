import pluginMdx from "@mdx-js/rollup";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { Plugin } from "vite";
import { rehypePluginPreWrapper } from "./rehypePlugins/preWrapper";

export function pluginMdxRollup() {
  return pluginMdx({
    remarkPlugins: [remarkGfm, remarkFrontmatter, [remarkMdxFrontmatter, { name: "frontmatter" }]],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          properties: {
            class: "header-anchor"
          },
          content: {
            type: "text",
            value: "#"
          }
        }
      ],
      rehypePluginPreWrapper
    ]
  }) as unknown as Plugin;
}
