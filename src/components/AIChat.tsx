import { useState } from "react";
import { Button, Input, message } from "antd";
import { useFileStore } from "../store/useFileStore";

export default function AIChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );
  const { setViewMode } = useFileStore();

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    try {
      // ✅ 建议直连后端端口，避免 vite 代理缓存：改成 8787
      const resp = await fetch("http://localhost:8787/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "qwen-flash",
          messages: [
            {
              role: "system",
              content:
                "你是一个 Markdown 写作助手，请始终用合理的 Markdown 结构输出。",
            },
            {
              role: "user",
              content: `请根据主题《${input.trim()}》输出结构化的 Markdown，包含：一级/二级标题、要点列表、代码示例（如适用），最后加上结尾总结。`,
            },
            ...messages,
            userMsg,
          ],
        }),
      });

      const reader = resp.body?.getReader();
      if (!reader) {
        message.error("没有读到后端流响应");
        return;
      }

      // 先插入一个 AI 占位消息，后面不断往里追加
      setMessages((m) => [...m, { role: "assistant", content: "" }]);

      const decoder = new TextDecoder("utf-8");
      let buffer = ""; // 🔹残包缓冲
      let fullText = ""; // 🔹最终完整文本（用于写回编辑器）

      // 小工具：消化 buffer 中的若干条 `data: ...` 记录
      const consumeBuffer = () => {
        // SSE 事件之间通常以 \n\n 断开；不同服务商格式略有差异，这里兼容 \n\n / \r\n\r\n
        const parts = buffer.split(/\r?\n\r?\n/);
        // 最后一段可能是不完整，先不处理
        buffer = parts.pop() || "";

        for (const part of parts) {
          // 每个 part 里可能包含多行，取以 `data:` 开头的行
          const lines = part
            .split(/\r?\n/)
            .filter((l) => l.startsWith("data: "));
          for (const line of lines) {
            const payload = line.slice(6).trim(); // 去掉 'data: '
            if (!payload) continue;
            if (payload === "[DONE]") continue; // 结束信号，循环外会自然 break

            // 🔸 解析 JSON
            let json: any;
            try {
              json = JSON.parse(payload);
            } catch {
              // 有时服务端会先发一个 "data: : ping" 一类的心跳，忽略
              continue;
            }

            // 🔸 取 delta.content 逐步追加
            const delta = json?.choices?.[0]?.delta;
            const piece = delta?.content ?? "";
            if (piece) {
              fullText += piece;

              // 实时更新“最后一条 AI 消息”
              setMessages((m) => {
                const copy = [...m];
                copy[copy.length - 1] = { role: "assistant", content: fullText || "…" };
                return copy;
              });
            }
          }
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        consumeBuffer(); // 🔥 每拿到一块就尽可能解析并渲染
      }
      // 读完后把剩余 buffer 再消化一次
      consumeBuffer();

      // ✅ 完成后把整段写入当前文件（在末尾追加换行）
      const { files, currentFileId, setSaved, saveToLocal } =
        useFileStore.getState();
      if (currentFileId) {
        const updated = files.map((f) =>
          f.id === currentFileId
            ? { ...f, content: f.content + "\n\n" + fullText }
            : f
        );
        useFileStore.setState({ files: updated });
        saveToLocal();
        setSaved(false);
      }
    } catch (e) {
      console.error(e);
      message.error("AI 生成失败，请检查后端或网络");
    }
  };

  return (
    <div
      className="ai-chat"
      style={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      <div
        style={{
          padding: "8px 12px",
          borderBottom: "1px solid #ddd",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <b>🧠 AI 写作助手</b>
        <Button size="small" onClick={() => setViewMode("editor")}>
          返回大纲
        </Button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <b>{m.role === "user" ? "你：" : "AI："}</b>
            <div>{m.content}</div>
          </div>
        ))}
      </div>

      <div
        style={{
          padding: "10px",
          borderTop: "1px solid #ddd",
          display: "flex",
          gap: "8px",
        }}
      >
        <Input.TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="请输入你的主题或问题..."
          autoSize={{ minRows: 1, maxRows: 4 }}
        />
        <Button type="primary" onClick={sendMessage}>
          发送
        </Button>
      </div>
    </div>
  );
}
