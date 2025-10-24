import { create } from "zustand";
import type { FileItem } from "../types/files";
import type { EditorView } from "@codemirror/view";

const STORAGE_KEY = "markdown_files";

// 页面视图类型
type ViewMode = "file" | "editor" | "ai";

interface FileStore {
  // === 状态 ===
  saveStatus: "saved" | "editing";
  theme: "light" | "dark";
  viewMode: ViewMode;

  files: FileItem[];
  currentFileId: string | null;

  // === 操作 ===
  toggleTheme: () => void;
  setViewMode: (mode: "file" | "editor" | "ai") => void
  setSaved: (saved: boolean) => void;

  addFile: () => void;
  deleteFile: (id: string) => void;
  renameFile: (id: string, newName: string) => void;
  setCurrentFile: (id: string) => void;
  loadFromLocal: () => void;
  saveToLocal: () => void;

  // === 编辑器实例 ===
  editorView: EditorView | null;
  setEditorView: (view: EditorView) => void;

  // === 页面级导航 ===
  navStack: ViewMode[];   // ["file", "editor"]
  navIndex: number;       // 当前页面索引
  navigateTo: (mode: ViewMode) => void;
  back: () => void;
  forward: () => void;

  // === 文件进入逻辑 ===
  enterFile: (id: string) => void;
}

export const useFileStore = create<FileStore>((set, get) => ({
  // === 初始状态 ===
  theme: "light",
  saveStatus: "saved",
  viewMode: "file",

  files: [],
  currentFileId: null,

  editorView: null,
  setEditorView: (view) => set({ editorView: view }),

  // === 页面导航栈（类似浏览器历史）===
  navStack: ["file"], // 初始在文件列表页
  navIndex: 0,

  navigateTo: (mode) => {
    const { navStack, navIndex } = get();
    const trunk = navStack.slice(0, navIndex + 1); // 如果从中间跳转，截断未来
    const nextStack =
      trunk[trunk.length - 1] === mode ? trunk : [...trunk, mode];
    set({
      viewMode: mode,
      navStack: nextStack,
      navIndex: nextStack.length - 1,
    });
  },

  back: () => {
    const { navIndex, navStack } = get();
    if (navIndex <= 0) return;
    const newIndex = navIndex - 1;
    set({
      navIndex: newIndex,
      viewMode: navStack[newIndex],
    });
  },

  forward: () => {
    const { navIndex, navStack } = get();
    if (navIndex >= navStack.length - 1) return;
    const newIndex = navIndex + 1;
    set({
      navIndex: newIndex,
      viewMode: navStack[newIndex],
    });
  },

  // === 文件逻辑 ===
  addFile: () => {
    const id = Date.now().toString();
    set((state) => ({
      files: [
        ...state.files,
        {
          id,
          name: "未命名文档",
          content: "",
          createdAt: new Date(),
        },
      ],
      currentFileId: id,
    }));
    get().navigateTo("editor");
    get().saveToLocal();
  },

  deleteFile: (id) => {
    set((state) => {
      const remain = state.files.filter((f) => f.id !== id);
      const stillCurrent =
        state.currentFileId === id ? null : state.currentFileId;
      return { files: remain, currentFileId: stillCurrent };
    });
    get().saveToLocal();
  },

  renameFile: (id, newName) => {
    set((state) => ({
      files: state.files.map((f) =>
        f.id === id ? { ...f, name: newName } : f
      ),
    }));
    get().saveToLocal();
  },

  setCurrentFile: (id) => set({ currentFileId: id }),

  enterFile: (id) => {
    set({ currentFileId: id });
    get().navigateTo("editor");
  },

  // === 保存状态 ===
  setSaved: (saved) => set({ saveStatus: saved ? "saved" : "editing" }),

  loadFromLocal: () => {
    const cache = localStorage.getItem(STORAGE_KEY);
    if (!cache) return;
    const data = JSON.parse(cache);
    set({
      files: data.files || [],
      currentFileId: data.currentFileId || null,
    });
  },

  saveToLocal: () => {
    const { files, currentFileId } = get();
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ files, currentFileId })
    );
  },

  // === 主题切换 ===
  toggleTheme: () => {
    const next = get().theme === "light" ? "dark" : "light";
    set({ theme: next });
    document.documentElement.setAttribute("data-theme", next);
    get().saveToLocal();
  },

  // === 页面模式设置 ===
  setViewMode: (mode) => set({ viewMode: mode }),
}));
