import { useEffect } from "react";
import "./styles/global.css";
import { message } from "antd";
import FileTree from "./components/FileTree";
import Editor from "./components/Editor";
import Preview from "./components/Preview";
import { useFileStore } from "./store/useFileStore";
import Toolbar from "./components/Toolbar";
import StatusBar from "./components/StatusBar";
import { App as AntdApp } from "antd";

function App() {
  const loadFromLocal = useFileStore((state) => state.loadFromLocal);
  const saveToLocal = useFileStore((s) => s.saveToLocal);
  const setSaved = useFileStore((s) => s.setSaved);

  useEffect(() => {
    loadFromLocal();
  }, []);
  useEffect(() => {
  const handleSave = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      console.log("🔥 Save triggered!");
      saveToLocal();
      setSaved(true);
      console.log("🔥 Save triggered!！");
      message.success("已保存文档");
    }
  };

   // ✅ 捕获事件，避免被编辑器拦截
  window.addEventListener("keydown", handleSave, true);
  return () => window.removeEventListener("keydown", handleSave, true);
}, [saveToLocal, setSaved]);

  return (
  <AntdApp>
    <div className="app-layout">
      <div className="topbar">
        {" "}
        <Toolbar />
      </div>

      <div className="content">
        <div className="file-tree">
          <FileTree />
        </div>
        <div className="editor">
          <Editor />
        </div>
        <div className="preview">
          <Preview />
        </div>
      </div>

      <div className="statusbar"><StatusBar/></div>
    </div>
  </AntdApp>
  );
}

export default App;
