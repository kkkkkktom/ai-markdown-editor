// src/components/Welcome.tsx
import { Button } from "antd";
import { FileAddOutlined } from "@ant-design/icons";
import { useFileStore } from "../store/useFileStore";

export default function Welcome() {
  const addFile = useFileStore((s) => s.addFile);

  return (
    <div
      style={{
        padding: "80px 20px",
        textAlign: "center",
        color: "var(--text-color)",
      }}
    >
      <h2>欢迎使用 Markdown Editor</h2>
      <p style={{ marginTop: 8, color: "#888" }}>
        从左侧选择一个文件开始编辑，或创建一个新文档。
      </p>
      <Button
        type="primary"
        icon={<FileAddOutlined />}
        style={{ marginTop: 20 }}
        onClick={addFile}
      >
        新建文档
      </Button>
    </div>
  );
}
