import { create } from 'zustand'
import type { FileItem } from '../types/files'
import type { EditorView } from "@codemirror/view";

const STORAGE_KEY = "markdown_files"

interface FileStore {
  saveStatus: "saved" | "editing";
  theme: "light" | "dark"
  toggleTheme: () => void

  files: FileItem[]
  currentFileId: string | null

  addFile: () => void
  deleteFile: (id: string) => void
  renameFile: (id: string, newName: string) => void
  setCurrentFile: (id: string) => void

  viewMode: "file" | "editor"; // 👈 新增
  setViewMode: (mode: "file" | "editor") => void; // 👈 新增

  loadFromLocal: () => void
  saveToLocal: () => void
  setSaved: (saved: boolean) => void;

  // ✅ 新增 Editor 实例存储
  editorView: EditorView | null;
  setEditorView: (view: EditorView) => void;


}

export const useFileStore = create<FileStore>((set, get) => ({
  theme: "light",
  saveStatus: "saved",

  viewMode: "file",
  setViewMode: (mode) => set({ viewMode: mode }),

  setSaved: (saved) =>
    set({
      saveStatus: saved ? "saved" : "editing",
    }),

  toggleTheme: () => {
    const next = get().theme === "light" ? "dark" : "light"
    set({ theme: next })
    document.documentElement.setAttribute("data-theme", next)
    get().saveToLocal()
  },

  files: [],
  currentFileId: null,

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
      viewMode: "editor",
    }))
    get().saveToLocal()
  },

  deleteFile: (id) => {
    set((state) => ({
      files: state.files.filter((f) => f.id !== id),
      currentFileId:
        state.currentFileId === id ? null : state.currentFileId,
    }))
    get().saveToLocal()
  },

  renameFile: (id, newName) => {
    set((state) => ({
      files: state.files.map((f) =>
        f.id === id ? { ...f, name: newName } : f
      ),
    }))
    get().saveToLocal()
  },

  setCurrentFile: (id) => set(() => ({ currentFileId: id, viewMode: "editor", })),

  loadFromLocal: () => {
    const cache = localStorage.getItem(STORAGE_KEY)
    if (!cache) return
    const data = JSON.parse(cache)
    set({
      files: data.files || [],
      currentFileId: data.currentFileId || null,
    })
  },

  saveToLocal: () => {
    const { files, currentFileId } = get()
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ files, currentFileId })
    )
  },
  editorView: null,
  setEditorView: (view) => set({ editorView: view }),
}))
