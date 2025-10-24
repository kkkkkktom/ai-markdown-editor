// src/api/ai.ts
export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function generateMarkdownByAI(
  prompt: string,
  model = "qwen-flash"
) {
  const resp = await fetch("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: "你是一个 Markdown 写作助手，请始终用合理的 Markdown 结构输出。",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  const data = await resp.json();
  if (!resp.ok)
    throw new Error(data?.error?.message || JSON.stringify(data));
  return data.choices?.[0]?.message?.content as string;
}
