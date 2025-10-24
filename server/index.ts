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

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => console.log(`🚀 AI proxy running at http://localhost:${PORT}`));
