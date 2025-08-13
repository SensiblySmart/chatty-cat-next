import type { NextApiResponse } from "next";
import { SendMessageRequestSchema } from "@/src/dto/message.dto";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import {
  chain,
  withMethods,
  withAuth,
  withZod,
  ExtendedNextApiRequest,
} from "@/utils/api/handler";
import { messageService } from "@/src/service/message.service";
import { conversationService } from "@/src/service/conversation.service";
import { llm } from "@/src/llm/LLM";
import { ModelMessage } from "ai";
import { z } from "zod";

const handler = async function handler(
  req: ExtendedNextApiRequest,
  res: NextApiResponse
) {
  const messageData = req.validated as z.infer<typeof SendMessageRequestSchema>;
  const userId = req.session.user.id;

  try {
    // 1. 创建用户消息
    await messageService.createMessage({
      ...messageData,
      role: "user",
      sender_id: userId,
    });

    const conversation = await conversationService.getConversationById(
      messageData.conversation_id
    );

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // 2. 获取会话历史消息用于LLM上下文
    const historyMessages = await messageService.getMessagesByConversationId(
      messageData.conversation_id
    );

    // 3. 转换为LLM格式的消息
    const llmMessages: ModelMessage[] = historyMessages.map((msg) => ({
      role: msg.role,
      content: msg.content.text,
    }));

    console.log("llmMessages", llmMessages);

    // 4. 设置SSE响应头
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders?.();

    // 5. 心跳机制
    const heartbeat = setInterval(() => {
      try {
        res.write(`: heartbeat\n\n`);
      } catch {}
    }, 15000);

    // 6. 用于收集完整的agent回复
    let fullAgentResponse = "";
    let isStreamCompleted = false;

    // 7. 后台任务：保存完整的agent消息
    const saveAgentMessage = async () => {
      if (fullAgentResponse.trim()) {
        try {
          await messageService.createMessage({
            conversation_id: messageData.conversation_id,
            sender_id: conversation.agent_id,
            role: "assistant",
            content: { text: fullAgentResponse },
          });

          await conversationService.updateLastMessageTime(
            messageData.conversation_id
          );

          console.log("Agent message saved successfully");
        } catch (error) {
          console.error("Failed to save agent message:", error);
          // 这里可以添加重试逻辑或者写入错误日志
        }
      }
    };

    // 8. 清理函数
    const cleanup = () => {
      clearInterval(heartbeat);

      // 如果流还没完成但连接断开了，仍然保存已收集的消息
      if (!isStreamCompleted) {
        console.log(
          "Connection closed before stream completion, saving partial response"
        );
        saveAgentMessage().catch(console.error);
      }

      try {
        res.end();
      } catch {}
    };

    // 9. 监听客户端断开
    req.on("close", cleanup);
    req.on("aborted", cleanup);

    try {
      // 10. 开始流式生成
      const { textStream } = await llm.streamText(llmMessages);

      // 11. 流式返回并收集完整响应
      for await (const chunk of textStream) {
        fullAgentResponse += chunk;

        try {
          res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
        } catch {
          // 如果写入失败（连接断开），停止流但继续保存消息
          console.log("Write failed, connection likely closed");
          break;
        }
      }

      // 12. 流完成
      isStreamCompleted = true;

      // 13. 发送完成事件
      try {
        res.write(
          `event: done\ndata: ${JSON.stringify({
            message: "Stream completed",
          })}\n\n`
        );
      } catch {}

      // 14. 保存完整的agent消息
      await saveAgentMessage();

      clearInterval(heartbeat);
      res.end();
    } catch (streamError) {
      console.error("Stream error:", streamError);

      // 即使流出错，也尝试保存已收集的内容
      if (fullAgentResponse.trim()) {
        await saveAgentMessage();
      }

      try {
        res.write(
          `event: error\ndata: ${JSON.stringify({
            message:
              streamError instanceof Error
                ? streamError.message
                : "Stream error",
          })}\n\n`
        );
      } catch {}

      cleanup();
    }
  } catch (error) {
    console.error("Message send error:", error);

    try {
      res.write(
        `event: error\ndata: ${JSON.stringify({
          message: error instanceof Error ? error.message : "Unknown error",
        })}\n\n`
      );
      res.end();
    } catch {
      return res.status(500).json({
        message: "Failed to send message",
        code: 1,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
};

export default chain(
  withMethods(["POST"]),
  withAuth(authOptions),
  withZod(SendMessageRequestSchema, "body")
)(handler);
