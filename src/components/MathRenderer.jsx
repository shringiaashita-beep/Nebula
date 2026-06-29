import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

export default function MathRenderer({ text }) {
  if (!text) return null;

  let content = text;

  // Convert standard AI math delimiters to markdown-math delimiters (\( -> $, \[ -> $$)
  content = content.replace(/\\\[/g, "$$").replace(/\\\]/g, "$$");
  content = content.replace(/\\\(/g, "$").replace(/\\\)/g, "$");

  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
    >
      {content}
    </ReactMarkdown>
  );
}