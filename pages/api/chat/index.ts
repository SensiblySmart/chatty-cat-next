import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

const schema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["system", "user", "assistant"]),
      content: z.string(),
    })
  ),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    // 校验请求体
    const parseResult = schema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: "Invalid request body",
        details: parseResult.error.errors,
      });
    }

    const { messages } = parseResult.data;

    // 必须在写入任何数据前设置头
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    // Nginx/Heroku 等反代有时需要明确关闭压缩
    res.setHeader("X-Accel-Buffering", "no");

    // 立刻把头刷给客户端
    res.flushHeaders?.();

    // 心跳，防止中间层断开空闲连接（每 15s 一个注释行或 ping 事件）
    const heartbeat = setInterval(() => {
      res.write(`: heartbeat\n\n`); // SSE 注释行，不会触发消息事件
    }, 15000);

    // 客户端断开时清理
    const onClose = () => {
      clearInterval(heartbeat);
      try {
        res.end();
      } catch {}
    };
    req.on("close", onClose);
    req.on("aborted", onClose);

    const { textStream } = streamText({
      model: openai("gpt-4o"),
      messages,
    });

    // 把增量文本一段段写成 SSE 消息
    for await (const chunk of textStream) {
      // 你也可以用 event:token 自定义事件名，默认就是 message 事件
      res.write(`data: ${chunk}\n\n`);
    }

    // 发送一个“完成”事件，前端好收尾
    res.write(`event: done\ndata: [DONE]\n\n`);

    clearInterval(heartbeat);
    res.end();
  } catch (err: unknown) {
    // SSE 下也可以返回一个 error 事件，便于前端处理
    const errorMessage = err instanceof Error ? err.message : "internal error";
    try {
      res.write(
        `event: error\ndata: ${JSON.stringify({
          message: errorMessage,
        })}\n\n`
      );
      res.end();
    } catch {
      return res.status(500).json({ error: errorMessage });
    }
  }
}
