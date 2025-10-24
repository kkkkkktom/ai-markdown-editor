import React from "react";

interface MenuProps {
  x: number;
  y: number;
  visible: boolean;
  onRename: () => void;
  onDelete: () => void;
  onClose: () => void;
}

const ContextMenu: React.FC<MenuProps> = ({
  x,
  y,
  visible,
  onRename,
  onDelete,
  onClose,
}) => {
  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: y,
        left: x,
        background: "#fff",
        border: "1px solid #ccc",
        borderRadius: 4,
        padding: "6px 0",
        zIndex: 9999,
        width: 140,
      }}
      onClick={onClose}
    >
      <div
        style={menuItemStyle}
        onClick={onRename}
      >
        重命名
      </div>

      <div
        style={{ ...menuItemStyle, color: "red" }}
        onClick={onDelete}
      >
        删除
      </div>
    </div>
  );
};

const menuItemStyle: React.CSSProperties = {
  padding: "8px 12px",
  cursor: "pointer",
};

export default ContextMenu;
