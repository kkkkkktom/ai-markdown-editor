import { Button, Space, Dropdown, Upload, Tooltip, type MenuProps, message } from "antd";
import {
  FileAddOutlined,
  SaveOutlined,
  DownloadOutlined,
  UploadOutlined,
  BoldOutlined,
  ItalicOutlined,
  FontSizeOutlined,
  LinkOutlined,
  TableOutlined,
  CheckSquareOutlined,
  BulbOutlined,
} from "@ant-design/icons";
import { useFileStore } from "../store/useFileStore";
import { downloadFile, readMarkdownFile } from "../utils/file";

// Markdown 插入逻辑
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

  const range = selection?.getRangeAt(0);
  if (range) {
    range.deleteContents();
    range.insertNode(document.createTextNode(textToInsert));

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
  const files = useFileStore((s) => s.files);
  const currentFileId = useFileStore((s) => s.currentFileId);
  const setFiles = useFileStore.setState;

  const currentFile = files.find((f) => f.id === currentFileId);

  // 导出 Markdown
  const handleExport = () => {
    if (!currentFile) {
      message.warning("请选择要导出的文件");
      return;
    }
    downloadFile(currentFile.name, currentFile.content);
    message.success(`已导出 ${currentFile.name}.md ✅`);
  };

  // 导入 Markdown
  const handleImport = async (file: File) => {
    try {
      const content = await readMarkdownFile(file);
      const newFile = {
        id: Date.now().toString(),
        name: file.name.replace(".md", ""),
        content,
        createdAt: new Date(),
      };
      setFiles((state) => ({ files: [...state.files, newFile] }));
      message.success(`成功导入 ${file.name}`);
    } catch (err) {
      message.error("导入失败，请重试");
    }
  };

  // 标题菜单
  const headingMenu: MenuProps = {
    items: [
      { key: "h1", label: "H1 一级标题" },
      { key: "h2", label: "H2 二级标题" },
      { key: "h3", label: "H3 三级标题" },
    ],
    onClick: (info) => insertMarkdownSyntax(info.key),
  };

  return (
    <div
      style={{
        height: 50,
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
        <Tooltip title="新建文件" placement="top" mouseEnterDelay={0.3}>
          <Button icon={<FileAddOutlined />} onClick={addFile} />
        </Tooltip>

        <Tooltip title="保存到本地" placement="top" mouseEnterDelay={0.3}>
          <Button
            icon={<SaveOutlined />}
            onClick={() => {
              saveToLocal();
              message.success("手动保存成功 ✅");
            }}
          />
        </Tooltip>

        <Tooltip title="导出 Markdown" placement="top" mouseEnterDelay={0.3}>
          <Button icon={<DownloadOutlined />} onClick={handleExport} />
        </Tooltip>

        <Upload
          showUploadList={false}
          accept=".md"
          beforeUpload={(file) => {
            handleImport(file);
            return false;
          }}
        >
          <Tooltip title="导入 Markdown" placement="top" mouseEnterDelay={0.3}>
            <Button icon={<UploadOutlined />} />
          </Tooltip>
        </Upload>

        {/* Markdown 编辑快捷按钮 */}
        <Tooltip title="加粗" placement="top" mouseEnterDelay={0.3}>
          <Button icon={<BoldOutlined />} onClick={() => insertMarkdownSyntax("bold")} />
        </Tooltip>

        <Tooltip title="斜体" placement="top" mouseEnterDelay={0.3}>
          <Button icon={<ItalicOutlined />} onClick={() => insertMarkdownSyntax("italic")} />
        </Tooltip>

        <Dropdown menu={headingMenu} placement="bottomLeft">
          <Tooltip title="插入标题" placement="top" mouseEnterDelay={0.3}>
            <Button icon={<FontSizeOutlined />} />
          </Tooltip>
        </Dropdown>

        <Tooltip title="插入链接" placement="top" mouseEnterDelay={0.3}>
          <Button icon={<LinkOutlined />} onClick={() => insertMarkdownSyntax("link")} />
        </Tooltip>

        <Tooltip title="插入任务列表" placement="top" mouseEnterDelay={0.3}>
          <Button icon={<CheckSquareOutlined />} onClick={() => insertMarkdownSyntax("task")} />
        </Tooltip>

        <Tooltip title="插入表格" placement="top" mouseEnterDelay={0.3}>
          <Button icon={<TableOutlined />} onClick={() => insertMarkdownSyntax("table")} />
        </Tooltip>
      </Space>

      {/* 主题切换 */}
      <Tooltip
        title={theme === "light" ? "切换到暗色模式" : "切换到亮色模式"}
        placement="top"
        mouseEnterDelay={0.3}
      >
        <Button
          icon={<BulbOutlined />}
          onClick={toggleTheme}
          type="text"
        />
      </Tooltip>
    </div>
  );
};

export default Toolbar;
