import CodeMirror from "@uiw/react-codemirror";
import { githubLight } from "@uiw/codemirror-theme-github";
import { markdown } from "@codemirror/lang-markdown";
import { keymap, EditorView } from "@codemirror/view";
import { EditorSelection } from "@codemirror/state";
import { useFileStore } from "../store/useFileStore";
import { useCallback, useEffect, useRef } from "react";
import { debounce } from "../utils/debounce";
import { message } from "antd";

// 🧩 工具函数：包裹或插入 Markdown 语法
const wrapOrInsert = (
  view: EditorView,
  before: string,
  after: string,
  placeholder: string,
  toggle?: {
    detect: (text: string) => boolean;
    unwrap: (text: string) => string;
  }
) => {
  const { state } = view;
  const tr = state.changeByRange((range) => {
    const selText = state.sliceDoc(range.from, range.to);
    // 如果选中且支持 toggle 且已包裹 → 取消包裹
    if (selText && toggle?.detect(selText)) {
      const unwrapped = toggle.unwrap(selText);
      return {
        changes: { from: range.from, to: range.to, insert: unwrapped },
        range: EditorSelection.range(
          range.from,
          range.from + unwrapped.length
        ),
      };
    }

    const body = selText || placeholder;
    const text = `${before}${body}${after}`;
    return {
      changes: { from: range.from, to: range.to, insert: text },
      range: EditorSelection.range(
        range.from + before.length,
        range.from + before.length + body.length
      ),
    };
  });
  view.dispatch(tr);
  return true;
};

// 设置标题（#、##、###）
const setHeading = (view: EditorView, level: 1 | 2 | 3) => {
  const prefix = "#".repeat(level) + " ";
  const { state } = view;
  const tr = state.changeByRange((range) => {
    const line = state.doc.lineAt(range.from);
    const text = line.text;
    const stripped = text.replace(/^\s{0,3}#{1,6}\s+/, "");
    const already = text.startsWith(prefix);
    const newText = already ? stripped : prefix + stripped;

    return {
      changes: { from: line.from, to: line.to, insert: newText },
      range: EditorSelection.cursor(line.from + newText.length),
    };
  });
  view.dispatch(tr);
  return true;
};

// 添加引用、任务列表
const prefixLine = (view: EditorView, prefix: string, placeholder = "") => {
  const { state } = view;
  const tr = state.changeByRange((range) => {
    const line = state.doc.lineAt(range.from);
    const hasPrefix = line.text.trimStart().startsWith(prefix.trim());
    const newLine = hasPrefix
      ? line.text.replace(new RegExp(`^\\s*${prefix}`), "")
      : `${prefix}${line.text || placeholder}`;
    return {
      changes: { from: line.from, to: line.to, insert: newLine },
      range: EditorSelection.cursor(line.from + newLine.length),
    };
  });
  view.dispatch(tr);
  return true;
};

// 插入表格模板
const insertTable = (view: EditorView) => {
  const tpl = `| 列1 | 列2 |\n| --- | --- |\n| 内容1 | 内容2 |`;
  const { state } = view;
  const tr = state.changeByRange((range) => ({
    changes: { from: range.from, to: range.to, insert: tpl },
    range: EditorSelection.cursor(range.from + tpl.length),
  }));
  view.dispatch(tr);
  return true;
};

// 插入代码块 ```js
const fenceCode = (view: EditorView, lang = "js") => {
  const { state } = view;
  const tr = state.changeByRange((range) => {
    const sel = state.sliceDoc(range.from, range.to) || "console.log('Hi')";
    const text = `\`\`\`${lang}\n${sel}\n\`\`\``;
    return {
      changes: { from: range.from, to: range.to, insert: text },
      range: EditorSelection.cursor(range.from + text.length),
    };
  });
  view.dispatch(tr);
  return true;
};

export default function Editor() {
  const { files, currentFileId, setSaved, saveToLocal ,setEditorView } = useFileStore();
  const currentFile = files.find((f) => f.id === currentFileId);
  const saveTimer = useRef<number | null>(null);

  // 🧠 自动保存逻辑
  const updateContent = useCallback(
    debounce((id: string, value: string) => {
      useFileStore.setState((state) => ({
        files: state.files.map((f) =>
          f.id === id ? { ...f, content: value } : f
        ),
      }));
      setSaved(false);

      if (saveTimer.current) window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(() => {
        saveToLocal();
        setSaved(true);
        console.log("💾 Auto-saved after 2s idle");
      }, 2000);
    }, 300),
    []
  );

  const onChange = (value: string) => {
    if (!currentFileId) return;
    updateContent(currentFileId, value);
  };

  useEffect(() => {
    console.log("🧩 Editor loaded, keymap active");
  }, []);

  if (!currentFile) {
    return <div style={{ padding: 16 }}>请选择一个文档开始编辑</div>;
  }

  return (
    <CodeMirror
      value={currentFile.content}
      theme={githubLight}
      basicSetup={{
        lineNumbers: false, // ✅ 关闭行号
        highlightActiveLine: false,
      }}
      extensions={[
        markdown(),
        keymap.of([
          // ✨ 粗体
          {
            key: "Mod-b",
            preventDefault: true,
            run: (view) =>
              wrapOrInsert(view, "**", "**", "粗体文本", {
                detect: (t) => /^\*\*.*\*\*$/.test(t),
                unwrap: (t) => t.replace(/^\*\*(.*)\*\*$/, "$1"),
              }),
          },
          // ✨ 斜体
          {
            key: "Mod-i",
            preventDefault: true,
            run: (view) =>
              wrapOrInsert(view, "*", "*", "斜体文本", {
                detect: (t) => /^\*.*\*$/.test(t),
                unwrap: (t) => t.replace(/^\*(.*)\*$/, "$1"),
              }),
          },
          // ✨ 代码块
          { key: "Mod-Shift-c", preventDefault: true, run: (v) => fenceCode(v) },
          // ✨ 标题：避免浏览器冲突，使用 Ctrl+Alt+1/2/3
          { key: "Mod-Alt-1", preventDefault: true, run: (v) => setHeading(v, 1) },
          { key: "Mod-Alt-2", preventDefault: true, run: (v) => setHeading(v, 2) },
          { key: "Mod-Alt-3", preventDefault: true, run: (v) => setHeading(v, 3) },
          // ✨ 引用、任务、表格
          { key: "Mod-Alt-q", preventDefault: true, run: (v) => prefixLine(v, "> ") },
          { key: "Mod-Alt-l", preventDefault: true, run: (v) => prefixLine(v, "- [ ] ", "待办事项") },
          { key: "Mod-Alt-t", preventDefault: true, run: insertTable },
        ]),
      ]}
      height="100%"
      onChange={onChange}
      onCreateEditor={(view: EditorView) => setEditorView(view)}
    />
  );
}
