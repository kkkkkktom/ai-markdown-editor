import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.BAILIAN_API_KEY;
const BASE_URL =
  process.env.BAILIAN_BASE_URL ||
  "https://dashscope.aliyuncs.com/compatible-mode/v1/";

console.log("🔑 BAILIAN_API_KEY:", API_KEY?.slice(0, 6) + "****");
console.log("🌐 BASE_URL:", BASE_URL);

app.post("/api/ai/chat", async (req, res) => {
  try {
    const { messages, model = "qwen-flash" } = req.body;

    // ✅ 只需要这一个请求
    const response = await fetch(`${BASE_URL}chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true, // ✅ 开启流模式
      }),
    });

    if (!response.body) {
      return res.status(500).send("No response body");
    }

    // ✅ 正确设置 SSE 头
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      res.write(chunk);
    }

    res.end();
  } catch (e) {
    console.error("❌ AI request failed:", e);
    res.status(500).json({ error: e instanceof Error ? e.message : "Server error" });
  }
});


// server/index.ts（新增或修改这个接口）
app.post("/api/ai/proofread", async (req, res) => {
  try {
    const { content, model = "qwen-flash" } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ error: "Missing content" });
    }

    console.log("🧠 Proofreading request received.");
    console.log("📄 Checking model:", model);

    // ✅ 正确调用阿里云模型
    const response = await fetch(`${BASE_URL}chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "你是一个 Markdown 语法与拼写检测助手。请严格返回 JSON 数组格式，每个对象包含 {from, to, message}，\
      from/to 是字符下标，只标错字的范围，不要标整句，不要加解释。形如：\
                [{\"from\": 5, \"to\": 7, \"message\": \"错别字：应为'天气'\"}]。\
                只返回 JSON，不要加文字说明，不要加反引号。",
          },
          {
            role: "user",
            content: `请分析以下 Markdown 文本，检测中文错别字或语法错误。\
              返回结果时请精确到字符范围（不要整句），只标出具体错误的单词或词语。\
             \n\n${content}`,

          },
        ],
      }),
    });

    const text = await response.text();
    console.log("📨 Proofread raw response:", text.slice(0, 200)); // 打印前200字符看格式

    if (!response.ok) {
      return res.status(response.status).json({ error: text });
    }

    const data = JSON.parse(text);
    const messageContent = data?.choices?.[0]?.message?.content || "[]";

    // 解析成 JSON 数组
    let errors = [];
    try {
      errors = JSON.parse(messageContent);
    } catch {
      console.warn("⚠️ 模型未返回 JSON 格式，返回原始内容");
      errors = [{ message: messageContent }];
    }

    res.json({ errors });
  } catch (e) {
    console.error("❌ AI 校对失败:", e);
    if (e instanceof Error) {
      res.status(500).json({ error: e?.message || "Server error" });
    }
  }
});


const PORT = process.env.PORT || 8787;
app.listen(PORT, () => console.log(`🚀 AI proxy running at http://localhost:${PORT}`));
