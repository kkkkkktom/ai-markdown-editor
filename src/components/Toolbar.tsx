import { Button, Space, Dropdown, type MenuProps, message } from "antd";
import {
  FileAddOutlined,
  BulbOutlined,
  BoldOutlined,
  ItalicOutlined,
  FontSizeOutlined,
  LinkOutlined,
  TableOutlined,
  CheckSquareOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useFileStore } from "../store/useFileStore";

/**
 * 在 CodeMirror 编辑器中插入 Markdown 语法
 * 通过选中内容或光标位置插入
 */
const insertMarkdownSyntax = (syntax: string) => {
  const editorEl = document.querySelector<HTMLDivElement>(".cm-content");
  if (!editorEl) {
    message.warning("请先点击编辑区");
    return;
  }

  const selection = window.getSelection();
  const selectedText = selection?.toString() || "";
  let textToInsert = "";

  switch (syntax) {
    case "bold":
      textToInsert = `**${selectedText || "粗体文本"}**`;
      break;
    case "italic":
      textToInsert = `*${selectedText || "斜体文本"}*`;
      break;
    case "link":
      textToInsert = `[${selectedText || "链接文本"}](https://example.com)`;
      break;
    case "task":
      textToInsert = `- [ ] ${selectedText || "待办事项"}`;
      break;
    case "table":
      textToInsert =
        "| 标题1 | 标题2 |\n| ------ | ------ |\n| 内容1 | 内容2 |";
      break;
    case "h1":
      textToInsert = `# ${selectedText || "一级标题"}`;
      break;
    case "h2":
      textToInsert = `## ${selectedText || "二级标题"}`;
      break;
    case "h3":
      textToInsert = `### ${selectedText || "三级标题"}`;
      break;
    default:
      break;
  }

  // 使用更安全的插入方式（避免 execCommand 被废弃）
  const range = selection?.getRangeAt(0);
  if (range) {
    range.deleteContents();
    range.insertNode(document.createTextNode(textToInsert));

    // 光标移到文本末尾
    const newRange = document.createRange();
    newRange.selectNodeContents(editorEl);
    newRange.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(newRange);
  }
};

const Toolbar = () => {
  const addFile = useFileStore((s) => s.addFile);
  const toggleTheme = useFileStore((s) => s.toggleTheme);
  const theme = useFileStore((s) => s.theme);
  const saveToLocal = useFileStore((s) => s.saveToLocal);
  const currentFileId = useFileStore((s) => s.currentFileId);

  const headingMenu: MenuProps = {
    items: [
      { key: "h1", label: "H1 一级标题" },
      { key: "h2", label: "H2 二级标题" },
      { key: "h3", label: "H3 三级标题" },
    ],
    onClick: (info) =>
      insertMarkdownSyntax(info.key as "h1" | "h2" | "h3"),
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
        {/* 文件操作 */}
        <Button icon={<FileAddOutlined />} onClick={addFile} title="新建文件" />
        <Button
          icon={<SaveOutlined />}
          onClick={() => {
            saveToLocal();
            message.success("手动保存成功 ✅");
          }}
          title="保存到本地"
        />

        {/* Markdown 编辑快捷按钮 */}
        <Button icon={<BoldOutlined />} onClick={() => insertMarkdownSyntax("bold")} />
        <Button icon={<ItalicOutlined />} onClick={() => insertMarkdownSyntax("italic")} />

        <Dropdown menu={headingMenu} placement="bottomLeft">
          <Button icon={<FontSizeOutlined />} title="插入标题" />
        </Dropdown>

        <Button icon={<LinkOutlined />} onClick={() => insertMarkdownSyntax("link")} title="插入链接" />
        <Button icon={<CheckSquareOutlined />} onClick={() => insertMarkdownSyntax("task")} title="插入任务列表" />
        <Button icon={<TableOutlined />} onClick={() => insertMarkdownSyntax("table")} title="插入表格" />
      </Space>

      {/* 主题切换 */}
      <Button
        icon={<BulbOutlined />}
        onClick={toggleTheme}
        type="text"
        title={theme === "light" ? "切换到暗色模式" : "切换到亮色模式"}
      />
    </div>
  );
};

export default Toolbar;
