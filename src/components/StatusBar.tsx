import { useFileStore } from "../store/useFileStore";

export default function StatusBar() {
  const saveStatus = useFileStore((s) => s.saveStatus);

  return (
    <div className="statusbar">
      {saveStatus === "saved" ? "✅ Saved" : "✍️ Editing..."}
    </div>
  );
}
