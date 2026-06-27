import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

export default function MathRenderer({ text }) {
  if (!text) return null;

  let content = text;

  content = content.replace(
    /\\begin\{bmatrix\}([\s\S]*?)\\end\{bmatrix\}/g,
    (_, matrix) => {
      return `$$\\begin{bmatrix}${matrix}\\end{bmatrix}$$`;
    }
  );

  content = content.replace(
    /\\frac\{([^}]*)\}\{([^}]*)\}/g,
    (_, a, b) => `$\\\\frac{${a}}{${b}}$`
  );

  content = content.replace(
    /\\sqrt\{([^}]*)\}/g,
    (_, a) => `$\\\\sqrt{${a}}$`
  );

  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
    >
      {content}
    </ReactMarkdown>
  );
}