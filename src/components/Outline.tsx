import { useFileStore } from "../store/useFileStore";
import { useEffect, useState } from "react";

export default function Outline() {
  const { files, currentFileId, editorView } = useFileStore();
  const currentFile = files.find((f) => f.id === currentFileId);
  const [outline, setOutline] = useState<{ level: number; text: string; line: number }[]>([]);

  useEffect(() => {
    if (!currentFile?.content) {
      setOutline([]);
      return;
    }

    const lines = currentFile.content.split("\n");
    const headings = lines
      .map((line, idx) => {
        const match = line.match(/^(#{1,6})\s+(.*)/);
        if (match) {
          return {
            level: match[1].length,
            text: match[2],
            line: idx,
          };
        }
        return null;
      })
      .filter(Boolean) as { level: number; text: string; line: number }[];

    setOutline(headings);
  }, [currentFile?.content]);

  if (!outline.length)
    return <div style={{ padding: 16, color: "#888" }}>暂无大纲（请添加标题）</div>;

  const handleJump = (line: number) => {
    if (!editorView) return;
    const pos = editorView.state.doc.line(line + 1).from;
    editorView.dispatch({
      selection: { anchor: pos },
      scrollIntoView: true,
    });
    editorView.focus();
  };

  return (
    <div style={{ padding: 16 }}>
      <h3 style={{ marginBottom: 12 }}>📖 文档大纲</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {outline.map((item, idx) => (
          <li
            key={idx}
            onClick={() => handleJump(item.line)}
            style={{
              marginLeft: (item.level - 1) * 12,
              cursor: "pointer",
              padding: "4px 0",
              color: "var(--text-color)",
              fontSize: 14,
            }}
          >
            {item.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
