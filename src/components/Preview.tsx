import { useFileStore } from '../store/useFileStore'

export default function Preview() {
  const { files, currentFileId } = useFileStore()
  const currentFile = files.find((f) => f.id === currentFileId)

  return (
    <div style={{ padding: 16 }}>
      {currentFile ? currentFile.content : '暂无文档'}
    </div>
  )
}
