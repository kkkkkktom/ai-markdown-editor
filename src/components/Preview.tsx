import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";
import "highlight.js/styles/github-dark.css";
import { useFileStore } from "../store/useFileStore";
import { CodeBlock } from "./CodeBlock";

export default function Preview() {
  const { files, currentFileId, theme } = useFileStore();
  const currentFile = files.find((f) => f.id === currentFileId);

  if (!currentFile) {
    return (
      <div className="markdown-preview">
        <p>📄 暂无文档，请从左侧选择或新建文件。</p>
      </div>
    );
  }

  return (
    <div
      className="markdown-preview"
      style={{
        background: theme === "dark" ? "#1e1e1e" : "#fafafa",
        color: theme === "dark" ? "#ddd" : "#000",
        overflowY: "auto",
        padding: "16px 20px",
        fontSize: 15,
        lineHeight: 1.7,
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        skipHtml={false}
        components={{
          a: ({ node, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer" />
          ),
          code: CodeBlock,
        }}
      >
        {currentFile.content.replace(/\n/g, "  \n")}
      </ReactMarkdown>
    </div>
  );
}
