import { useFileStore } from '../store/useFileStore'

export default function FileTree() {
  const { files, currentFileId, setCurrentFile, addFile } = useFileStore()

  return (
    <div className="file-tree-box">
      <div className="file-tree-header">
        <button onClick={addFile}>新建文档</button>
      </div>

      <ul className="file-list">
        {files.map((file) => (
          <li
            key={file.id}
            className={file.id === currentFileId ? 'active' : ''}
            onClick={() => setCurrentFile(file.id)}
          >
            {file.name}
          </li>
        ))}
      </ul>
    </div>
  )
}
