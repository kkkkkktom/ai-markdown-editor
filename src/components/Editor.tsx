import CodeMirror from "@uiw/react-codemirror";
import { githubLight } from "@uiw/codemirror-theme-github";
import { markdown } from "@codemirror/lang-markdown";
import { useFileStore } from "../store/useFileStore";
import { useCallback } from "react";
import { debounce } from "../utils/debounce";
import { useEffect } from "react";
import { message } from "antd";


export default function Editor() {
  const { files, currentFileId, renameFile, setSaved, saveToLocal } =
    useFileStore();

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

    // ✅ 绑定到编辑区域，而不是 window
    const editorDom = document.querySelector<HTMLElement>(".cm-editor");
    editorDom?.addEventListener("keydown", handleKeyDown);

    return () => editorDom?.removeEventListener("keydown", handleKeyDown);
  }, [saveToLocal, setSaved]);

  const currentFile = files.find((f) => f.id === currentFileId);

  const updateContent = useCallback(
    debounce((id: string, value: string) => {
      useFileStore.setState((state) => ({
        files: state.files.map((f) =>
          f.id === id ? { ...f, content: value } : f
        ),
      }));
      setSaved(false);
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
