import { Button, Space, Dropdown, type MenuProps } from "antd";
import {
  FileAddOutlined,
  BulbOutlined,
  BoldOutlined,
  ItalicOutlined,
  FontSizeOutlined,
} from "@ant-design/icons";
import { useFileStore } from "../store/useFileStore";

const Toolbar = () => {
  const addFile = useFileStore((s) => s.addFile);
  const toggleTheme = useFileStore((s) => s.toggleTheme);
  const theme = useFileStore((s) => s.theme);
  const currentFileId = useFileStore((s) => s.currentFileId);

  const insertMarkdown = (syntax: "bold" | "italic" | "h1" | "h2" | "h3") => {
    const editor = document.querySelector<HTMLDivElement>(".cm-content");
    if (!editor || !currentFileId) return;
    const selection = window.getSelection();
    const selectedText = selection?.toString() || "";
    let replacedText = "";
    switch (syntax) {
      case "bold":
        replacedText = `**${selectedText || "粗体文本"}**`;
        break;
      case "italic":
        replacedText = `*${selectedText || "斜体文本"}*`;
        break;
      case "h1":
        replacedText = `# ${selectedText || "一级标题"}`;
        break;
      case "h2":
        replacedText = `## ${selectedText || "二级标题"}`;
        break;
      case "h3":
        replacedText = `### ${selectedText || "三级标题"}`;
        break;
    }
    document.execCommand("insertText", false, replacedText);
  };

  const headingMenu: MenuProps = {
    items: [
      { key: "h1", label: "H1 一级标题" },
      { key: "h2", label: "H2 二级标题" },
      { key: "h3", label: "H3 三级标题" },
    ],
    onClick: (info) => insertMarkdown(info.key as "h1" | "h2" | "h3"),
  };

  return (
    <div
      style={{
        height: 48,
        padding: "0 12px",
        borderBottom: "1px solid var(--border-color)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "var(--bg-secondary)",
      }}
    >
      <Space>
        <Button icon={<FileAddOutlined />} onClick={addFile} />
        <Button icon={<BoldOutlined />} onClick={() => insertMarkdown("bold")} />
        <Button icon={<ItalicOutlined />} onClick={() => insertMarkdown("italic")} />
        <Dropdown menu={headingMenu} placement="bottomLeft">
          <Button icon={<FontSizeOutlined />} />
        </Dropdown>
        <Button
        icon={<BulbOutlined />}
        onClick={toggleTheme}
        title={theme === "light" ? "切换到暗色" : "切换到亮色"}
      />
      </Space>

      
    </div>
  );
};

export default Toolbar;
