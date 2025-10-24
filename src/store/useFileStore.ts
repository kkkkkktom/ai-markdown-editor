import { create } from 'zustand'
import type { FileItem } from '../types/files'

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

    loadFromLocal: () => void
    saveToLocal: () => void
    setSaved: (saved: boolean) => void;


}

export const useFileStore = create<FileStore>((set, get) => ({
    theme: "light",
    saveStatus: "saved",
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
        set((state) => ({
            files: [
                ...state.files,
                {
                    id: Date.now().toString(),
                    name: "未命名文档",
                    content: "",
                    createdAt: new Date(),
                },
            ], 
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

    setCurrentFile: (id) => set(() => ({ currentFileId: id })),

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
}))
