import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { describe, expect, test } from "vitest";
import { rehypePluginPreWrapper } from "../../node/plugin-mdx/rehypePlugins/preWrapper";

describe("Markdown compile cases", () => {
  // 初始化processor
  const processor = unified().use(remarkParse).use(remarkRehype).use(rehypeStringify).use(rehypePluginPreWrapper);

  test("Compile Title", async () => {
    const mdContent = "# 123";
    const result = await processor.processSync(mdContent);
    expect(result.value).toMatchInlineSnapshot('"<h1>123</h1>"');
  });

  test("Comile Code", async () => {
    const codeContent = "I am using `Island.js`";
    const result = await processor.processSync(codeContent);
    expect(result.value).toMatchInlineSnapshot('"<p>I am using <code>Island.js</code></p>"');
  });

  test("Compile code block", async () => {
    const mdContent = "```js\nconsole.log(123);\n```";
    const result = processor.processSync(mdContent);
    expect(result.value).toMatchInlineSnapshot(`
      "<div class=\\"language-js\\"><span class=\\"lang\\">js</span><pre><code class=\\"language-js\\">console.log(123);
      </code></pre></div>"
    `);
  });
});
