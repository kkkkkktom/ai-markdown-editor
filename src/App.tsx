import './styles/global.css';
import FileTree from './components/FileTree';
import Editor from './components/Editor';
import Preview from './components/Preview'

function App() {
  return (
    <div className="app-layout">
      <div className="topbar">Top Toolbar</div>
      <div className="content">
        <div className="file-tree">
          <FileTree />
        </div>
        <div className="editor">
          <Editor />
        </div>
        <div className="preview"> <Preview /></div>
      </div>
      <div className="statusbar">Status Bar</div>
    </div>
  )
}

export default App
