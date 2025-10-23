import { useFileStore } from '../store/useFileStore'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function Preview() {
  const { files, currentFileId } = useFileStore()
  const currentFile = files.find((f) => f.id === currentFileId)

  if (!currentFile) {
    return <div style={{ padding: 16 }}>暂无文档</div>
  }

  return (
    <div className="markdown-preview">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {currentFile.content}
      </ReactMarkdown>
    </div>
  )
}
