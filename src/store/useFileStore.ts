import { create } from 'zustand'
import type{ FileItem } from '../types/files'

interface FileStore {
  files: FileItem[]
  currentFileId: string | null

  addFile: () => void
  deleteFile: (id: string) => void
  renameFile: (id: string, newName: string) => void
  setCurrentFile: (id: string) => void
}

export const useFileStore = create<FileStore>((set) => ({
  files: [],
  currentFileId: null,

  addFile: () =>
    set((state) => ({
      files: [
        ...state.files,
        {
          id: Date.now().toString(),
          name: '未命名文档',
          content: '',
          createdAt: new Date(),
        },
      ],
    })),

  deleteFile: (id) =>
    set((state) => ({
      files: state.files.filter((f) => f.id !== id),
      currentFileId:
        state.currentFileId === id ? null : state.currentFileId,
    })),

  renameFile: (id, newName) =>
    set((state) => ({
      files: state.files.map((f) =>
        f.id === id ? { ...f, name: newName } : f
      ),
    })),

  setCurrentFile: (id) =>
    set(() => ({
      currentFileId: id,
    })),
}))
