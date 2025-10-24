import { useState } from "react";
import { useFileStore } from "../store/useFileStore";
import ContextMenu from "./ContextMenu";
import { Button } from "antd";

export default function FileTree() {
  const {
    files,
    currentFileId,
    setCurrentFile,
    addFile,
    deleteFile,
    renameFile,
    enterFile
  } = useFileStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  // 📌 双击开始编辑
  const startEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };

  // 📌 保存编辑名字
  const commitRename = () => {
    if (editingId && editingName.trim()) {
      renameFile(editingId, editingName.trim());
    }
    setEditingId(null);
  };

  // 📌 右键菜单逻辑
  const [context, setContext] = useState({
    visible: false,
    x: 0,
    y: 0,
    fileId: "",
  });

  const openMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setContext({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      fileId: id,
    });
  };

  const closeMenu = () => setContext({ ...context, visible: false });

  const onRename = () => {
    const file = files.find((f) => f.id === context.fileId);
    if (file) startEdit(file.id, file.name);
    closeMenu();
  };

  const onDelete = () => {
    if (confirm("确定删除该文件？")) deleteFile(context.fileId);
    closeMenu();
  };

  return (
    <div className="file-tree-box" onClick={closeMenu}>
      <div className="file-tree-header">
        <Button onClick={addFile}>新建文档</Button>
      </div>

      <ul className="file-list">
        {files.map((file) => (
          <li
            key={file.id}
            className={file.id === currentFileId ? "active" : ""}
            onClick={() => enterFile(file.id)} 
            onContextMenu={(e) => openMenu(e, file.id)}
          >
            {/* ✅ 正在编辑 */}
            {editingId === file.id ? (
              <input
                value={editingName}
                autoFocus
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitRename();
                  if (e.key === "Escape") setEditingId(null);
                }}
                style={{
                  width: "100%",
                  fontSize: 14,
                }}
              />
            ) : (
              <span onDoubleClick={() => startEdit(file.id, file.name)}>
                {file.name}
              </span>
            )}
          </li>
        ))}
      </ul>

      <ContextMenu
        visible={context.visible}
        x={context.x}
        y={context.y}
        onClose={closeMenu}
        onRename={onRename}
        onDelete={onDelete}
      />
    </div>
  );
}
