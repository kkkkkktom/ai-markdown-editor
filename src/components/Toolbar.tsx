import {
  Button,
  Space,
  Dropdown,
  Upload,
  Tooltip,
  type MenuProps,
  message,
  Modal,
  Table,
  Input,
} from "antd";
import {
  RollbackOutlined,
  LeftOutlined,
  RightOutlined,
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
  BookOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import { useFileStore } from "../store/useFileStore";
import { downloadFile, readMarkdownFile } from "../utils/file";
import { useState } from "react";
import { EditorSelection } from "@codemirror/state";

// Markdown 插入逻辑
const insertMarkdownSyntax = (syntax: string) => {
  const view = useFileStore.getState().editorView; // 👈 直接取全局共享的 Editor 实例
  if (!view) return message.warning("请先点击编辑器区域");

  const { state } = view;
  const selection = state.selection.main;
  const selectedText = state.sliceDoc(selection.from, selection.to);

  let textToInsert = "";
  switch (syntax) {
    case "bold":
      textToInsert = `**${selectedText || "粗体文本"}**`;
      break;
    case "italic":
      textToInsert = `*${selectedText || "斜体文本"}*`;
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
  }

  view.dispatch({
    // ✅ 真正修改 CodeMirror 的 state
    changes: { from: selection.from, to: selection.to, insert: textToInsert },
    // ✅ 光标移动到新插入内容末尾
    selection: EditorSelection.cursor(selection.from + textToInsert.length),
  });
  view.focus();
};

interface ToolbarProps {
  isMobile: boolean;
  mobileView: "editor" | "preview";
  setMobileView: (view: "editor" | "preview") => void;
}

const Toolbar = ({ isMobile, mobileView, setMobileView }: ToolbarProps) => {
  const back = useFileStore((s) => s.back);
  const forward = useFileStore((s) => s.forward);
  const navigateTo = useFileStore((s) => s.navigateTo);
  const navIndex = useFileStore((s) => s.navIndex);
  const navStack = useFileStore((s) => s.navStack);
  const viewMode = useFileStore((s) => s.viewMode);

  const [isGuideVisible, setIsGuideVisible] = useState(false);
  const [isAIModalVisible, setIsAIModalVisible] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");

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

  // 模拟 AI 生成逻辑（后续会替换成实际接口）
  const handleAIGenerate = () => {
    if (!aiPrompt.trim()) return message.warning("请输入生成主题");

    message.loading("AI 正在生成内容...", 1.2);
    setTimeout(() => {
      const newFile = {
        id: Date.now().toString(),
        name: `AI生成-${aiPrompt}`,
        content: `# ${aiPrompt}\n\n由 AI 自动生成的 Markdown 示例。\n\n## 概述\nAI 可以根据输入主题生成结构化 Markdown 内容。\n\n- 支持多级标题\n- 自动分段与列点\n- 可结合手动编辑优化\n\n\`\`\`js\nconsole.log("AI Markdown Ready!");\n\`\`\`\n`,
        createdAt: new Date(),
      };
      setFiles((state) => ({ files: [...state.files, newFile] }));
      message.success("AI 生成完成 ✅");
      setAiPrompt("");
      setIsAIModalVisible(false);
    }, 1500);
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
    <>
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
          <Tooltip title="后退">
            <Button
              icon={<LeftOutlined />}
              onClick={back}
              disabled={navIndex <= 0}
            />
          </Tooltip>
          <Tooltip title="前进">
            <Button
              icon={<RightOutlined />}
              onClick={forward}
              disabled={navIndex >= navStack.length - 1}
            />
          </Tooltip>
          <Tooltip title="返回文件列表">
            <Button
              icon={<RollbackOutlined />}
              onClick={() => navigateTo("file")}
              disabled={viewMode === "file"}
            />
          </Tooltip>

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

          <Tooltip title="AI 生成文档" placement="top" mouseEnterDelay={0.3}>
            <Button
              type="primary"
              icon={<RobotOutlined />}
              onClick={() => setIsAIModalVisible(true)}
            >
              AI 生成
            </Button>
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
            <Tooltip
              title="导入 Markdown"
              placement="top"
              mouseEnterDelay={0.3}
            >
              <Button icon={<UploadOutlined />} />
            </Tooltip>
          </Upload>

          {/* Markdown 编辑快捷按钮 */}
          <Tooltip title="加粗" placement="top" mouseEnterDelay={0.3}>
            <Button
              icon={<BoldOutlined />}
              onClick={() => insertMarkdownSyntax("bold")}
            />
          </Tooltip>

          <Tooltip title="斜体" placement="top" mouseEnterDelay={0.3}>
            <Button
              icon={<ItalicOutlined />}
              onClick={() => insertMarkdownSyntax("italic")}
            />
          </Tooltip>

          <Dropdown menu={headingMenu} placement="bottomLeft">
            {/* <Tooltip title="插入标题" placement="top" mouseEnterDelay={0.3}> */}
            <Button icon={<FontSizeOutlined />} />
            {/* </Tooltip> */}
          </Dropdown>

          <Tooltip title="插入链接" placement="top" mouseEnterDelay={0.3}>
            <Button
              icon={<LinkOutlined />}
              onClick={() => insertMarkdownSyntax("link")}
            />
          </Tooltip>

          <Tooltip title="插入任务列表" placement="top" mouseEnterDelay={0.3}>
            <Button
              icon={<CheckSquareOutlined />}
              onClick={() => insertMarkdownSyntax("task")}
            />
          </Tooltip>

          <Tooltip title="插入表格" placement="top" mouseEnterDelay={0.3}>
            <Button
              icon={<TableOutlined />}
              onClick={() => insertMarkdownSyntax("table")}
            />
          </Tooltip>

          {/* 🧭 Markdown 指南 */}
          <Tooltip
            title="查看 Markdown 使用说明"
            placement="top"
            mouseEnterDelay={0.3}
          >
            <Button
              icon={<BookOutlined />}
              onClick={() => setIsGuideVisible(true)}
            />
          </Tooltip>

        </Space>

        {/* 主题切换 */}
        <Tooltip
          title={theme === "light" ? "切换到暗色模式" : "切换到亮色模式"}
          placement="top"
          mouseEnterDelay={0.3}
        >
          <Button icon={<BulbOutlined />} onClick={toggleTheme} type="text" />
        </Tooltip>
      </div>
      {isMobile && (
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setMobileView("editor")}
            style={{
              padding: "6px 10px",
              background: mobileView === "editor" ? "#1677ff" : "#f0f0f0",
              color: mobileView === "editor" ? "#fff" : "#000",
              border: "none",
              borderRadius: "6px",
            }}
          >
            编辑
          </button>
          <button
            onClick={() => setMobileView("preview")}
            style={{
              padding: "6px 10px",
              background: mobileView === "preview" ? "#1677ff" : "#f0f0f0",
              color: mobileView === "preview" ? "#fff" : "#000",
              border: "none",
              borderRadius: "6px",
            }}
          >
            预览
          </button>
        </div>
      )}

      {/* 📘 Markdown 使用说明弹窗 */}
      <Modal
        title="📘 Markdown 使用指南"
        open={isGuideVisible}
        onCancel={() => setIsGuideVisible(false)}
        footer={null}
        width={720}
      >
        <Table
          pagination={false}
          size="small"
          bordered
          dataSource={[
            { key: 1, func: "标题", syntax: "# 一级标题", shortcut: "-" },
            {
              key: 2,
              func: "加粗",
              syntax: "**加粗文本**",
              shortcut: "Ctrl / ⌘ + B",
            },
            {
              key: 3,
              func: "斜体",
              syntax: "*斜体文本*",
              shortcut: "Ctrl / ⌘ + I",
            },
            {
              key: 4,
              func: "链接",
              syntax: "[文字](https://example.com)",
              shortcut: "-",
            },
            {
              key: 5,
              func: "任务列表",
              syntax: "- [ ] 待办事项",
              shortcut: "-",
            },
            {
              key: 6,
              func: "表格",
              syntax: "| 列1 | 列2 |\n| --- | --- |",
              shortcut: "-",
            },
            {
              key: 7,
              func: "代码块",
              syntax: "```js\nconsole.log('Hi')\n```",
              shortcut: "Ctrl / ⌘ + Shift + C",
            },
            { key: 8, func: "引用", syntax: "> 引用文本", shortcut: "-" },
          ]}
          columns={[
            { title: "功能", dataIndex: "func", key: "func", width: 120 },
            { title: "Markdown 语法", dataIndex: "syntax", key: "syntax" },
            {
              title: "快捷键",
              dataIndex: "shortcut",
              key: "shortcut",
              width: 160,
            },
          ]}
        />
      </Modal>

      {/* 🤖 AI 生成弹窗 */}
      <Modal
        title="✨ AI 一键生成 Markdown"
        open={isAIModalVisible}
        onCancel={() => setIsAIModalVisible(false)}
        onOk={handleAIGenerate}
        okText="生成"
        cancelText="取消"
      >
        <p>请输入主题，例如 “前端性能优化” 或 “AI 如何改变写作方式”：</p>
        <Input
          placeholder="输入主题..."
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          onPressEnter={handleAIGenerate}
        />
      </Modal>
    </>
  );
};

export default Toolbar;
