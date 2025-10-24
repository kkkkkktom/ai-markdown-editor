import CodeMirror from "@uiw/react-codemirror";
import { githubLight } from "@uiw/codemirror-theme-github";
import { markdown } from "@codemirror/lang-markdown";
import { useFileStore } from "../store/useFileStore";
import { useCallback, useEffect, useRef } from "react";
import { debounce } from "../utils/debounce";
import { message } from "antd";

export default function Editor() {
  const { files, currentFileId, setSaved, saveToLocal } = useFileStore();
  const currentFile = files.find((f) => f.id === currentFileId);
  // ✅ 浏览器环境应使用 number 类型，而非 NodeJS.Timeout
  const saveTimer = useRef<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveToLocal();
        setSaved(true);
        message.success("已保存 ✅");
        console.log("🔥 Save triggered from Editor");
      }
    };

    const editorDom = document.querySelector<HTMLElement>(".cm-editor");
    editorDom?.addEventListener("keydown", handleKeyDown);
    return () => editorDom?.removeEventListener("keydown", handleKeyDown);
  }, [saveToLocal, setSaved]);

  // 🧠 内容更新 + 自动保存
  const updateContent = useCallback(
    debounce((id: string, value: string) => {
      useFileStore.setState((state) => ({
        files: state.files.map((f) =>
          f.id === id ? { ...f, content: value } : f
        ),
      }));
      setSaved(false);

      // 清除旧定时器
      if (saveTimer.current) window.clearTimeout(saveTimer.current);

      // 🕒 停止输入 2 秒后自动保存
      saveTimer.current = window.setTimeout(() => {
        saveToLocal();
        setSaved(true);
        console.log("💾 Auto-saved after typing pause");
      }, 2000);
    }, 300),
    []
  );

  const onChange = (value: string) => {
    if (!currentFileId) return;
    updateContent(currentFileId, value);
  };

  if (!currentFile) {
    return <div style={{ padding: 16 }}>请选择一个文档开始编辑</div>;
  }

  return (
    <CodeMirror
      value={currentFile.content}
      theme={githubLight}
      extensions={[markdown()]}
      height="100%"
      onChange={onChange}
    />
  );
}
