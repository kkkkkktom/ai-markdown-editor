import './styles/global.css';

function App() {
  return (
    <div className="app-layout">
      <div className="topbar">Top Toolbar</div>
      <div className="content">
        <div className="file-tree">File Tree</div>
        <div className="editor">Editor Area</div>
        <div className="preview">Preview</div>
      </div>
      <div className="statusbar">Status Bar</div>
    </div>
  )
}

export default App
