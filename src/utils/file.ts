// 保存文件道本地
export const downloadFile = (filename: string, content: string) => {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename.endsWith(".md") ? filename : `${filename}.md`;
  link.click();
  URL.revokeObjectURL(link.href);
};

// 实现「导入 Markdown 文件」
export const readMarkdownFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file, "utf-8");
  });
};
