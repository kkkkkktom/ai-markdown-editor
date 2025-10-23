import './styles/global.css';
import FileTree from './component/FileTree'

function App() {
  return (
    <div className="app-layout">
      <div className="topbar">Top Toolbar</div>
      <div className="content">
        <div className="file-tree">
          <FileTree />
        </div>
        <div className="editor">Editor Area</div>
        <div className="preview">Preview</div>
      </div>
      <div className="statusbar">Status Bar</div>
    </div>
  )
}

export default App
