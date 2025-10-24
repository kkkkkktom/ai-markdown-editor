import {
  PanelGroup,
  Panel,
  PanelResizeHandle,
} from "react-resizable-panels";
import "./styles/global.css";
import { message, App as AntdApp } from "antd";
import { useEffect } from "react";
import FileTree from "./components/FileTree";
import Outline from "./components/Outline";
import Editor from "./components/Editor";
import Preview from "./components/Preview";
import Welcome from "./components/Welcome";
import Toolbar from "./components/Toolbar";
import StatusBar from "./components/StatusBar";
import { useFileStore } from "./store/useFileStore";

function App() {
  const loadFromLocal = useFileStore((s) => s.loadFromLocal);
  const saveToLocal = useFileStore((s) => s.saveToLocal);
  const setSaved = useFileStore((s) => s.setSaved);
  const viewMode = useFileStore((s) => s.viewMode);

  useEffect(() => {
    loadFromLocal();
  }, []);

  useEffect(() => {
    const handleSave = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveToLocal();
        setSaved(true);
        message.success("已保存文档");
      }
    };
    window.addEventListener("keydown", handleSave, true);
    return () => window.removeEventListener("keydown", handleSave, true);
  }, [saveToLocal, setSaved]);

  return (
    <AntdApp>
      <div className="app-layout">
        {/* 顶部工具栏 */}
        <div className="topbar">
          <Toolbar />
        </div>

        {/* ✅ 使用 react-resizable-panels 创建三栏布局 */}
        <PanelGroup direction="horizontal" style={{ height: "calc(100vh - 80px)" }}>
          {/* 左栏：文件树 / 大纲 */}
          <Panel defaultSize={20} minSize={10}>
            <div className="file-tree">
              {viewMode === "file" ? <FileTree /> : <Outline />}
            </div>
          </Panel>

          <PanelResizeHandle className="resize-handle" />

          {/* 中间：欢迎页 / 编辑器 */}
          <Panel defaultSize={50} minSize={30}>
            <div className="editor">
              {viewMode === "file" ? <Welcome /> : <Editor />}
            </div>
          </Panel>

          <PanelResizeHandle className="resize-handle" />

          {/* 右栏：预览 */}
          <Panel defaultSize={30} minSize={20}>
            <div className="preview">
              <Preview />
            </div>
          </Panel>
        </PanelGroup>

        {/* 底部状态栏 */}
        <div className="statusbar">
          <StatusBar />
        </div>
      </div>
    </AntdApp>
  );
}

export default App;
