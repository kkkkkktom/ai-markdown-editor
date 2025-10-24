import type { Components } from "react-markdown";
import React from "react";

export const CodeBlock: React.FC<{
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}> = ({ inline, className, children, ...props }) => {
  if (inline) {
    return (
      <code
        style={{
          background: "#eee",
          padding: "2px 4px",
          borderRadius: 4,
        }}
        {...props}
      >
        {children}
      </code>
    );
  }

  return (
    <pre
      className={className}
      style={{
        background: "#f6f8fa",
        padding: 12,
        borderRadius: 6,
        overflowX: "auto",
      }}
    >
      <code {...props}>{children}</code>
    </pre>
  );
};

