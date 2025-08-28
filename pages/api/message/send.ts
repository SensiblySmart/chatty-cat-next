import type { NextApiResponse } from "next";
import { SendMessageRequestSchema,SendMessageRequestDto } from "@/src/dto/message.dto";
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
import LLM from "@/src/llm/LLM";
import { z } from "zod";
import { modelService } from "@/src/service/model.service";
import agentService from "@/src/service/agent.service";
import { generateTitle } from "@/src/llm/helper";
import { Message } from "mem0ai";
import MemoryManager from "@/src/memory/MemoryManager";
import Langfuse from "langfuse";
import { MessageTypeSchema,  RoleSchema, RoleType } from "@/prisma/generated/zod";

const langfuse = new Langfuse({});

const handler = async function handler(
  req: ExtendedNextApiRequest,
  res: NextApiResponse
) {
  const messageData = req.validated as SendMessageRequestDto;
  const userId = req.session.user.id;

  try {
    // 1. check conversation is exist
    const conversation = await conversationService.getConversation(
      messageData.conversationId,
      userId
    );

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // 2. create user message
    const userMessage = await messageService.createMessage({
      ...messageData,
      role: RoleSchema.Enum.User,
      senderId: userId,
    });

    // 3. get history messages for LLM context
    const historyMessages = await messageService.getMessagesByConversationId(
      messageData.conversationId
    );

    const messages: Message[] = historyMessages.map((msg) => ({
      role: msg.role.toLowerCase() as Lowercase<RoleType>,
      content: msg.content,
    }));
    const memoryManager = new MemoryManager(userId);
    await memoryManager.processUserMessages(messages);

    // if title is not set, generate title
    if (!conversation.title) {
      const title = await generateTitle(messages);
      await conversationService.updateConversationTitle(
        messageData.conversationId,
        title,
        userId
      );
    }

    // 5. set SSE response headers
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders?.();

    // 6. heartbeat mechanism
    const heartbeat = setInterval(() => {
      try {
        res.write(`: heartbeat\n\n`);
      } catch {}
    }, 15000);

    // 7. for collecting full agent response
    let fullAgentResponse = "";
    let isStreamCompleted = false;

    // 8. background task: save full agent message
    const saveAgentMessage = async () => {
      if (fullAgentResponse.trim()) {
        try {
          await messageService.createMessage({
            conversationId: messageData.conversationId,
            senderId: conversation.agentId,
            role: RoleSchema.Enum.ASSISTANT,
            content: fullAgentResponse,
            messageType: MessageTypeSchema.Enum.TEXT,
          });

          await conversationService.updateLastMessageTime(
            messageData.conversationId,
            userId
          );

          console.log("Agent message saved successfully");
        } catch (error) {
          console.error("Failed to save agent message:", error);
          // 这里可以添加重试逻辑或者写入错误日志
        }
      }
    };

    // 9. cleanup function
    const cleanup = () => {
      clearInterval(heartbeat);

      // if stream is not completed but connection is closed, still save the collected messages
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

    // 10. listen to client disconnect
    req.on("close", cleanup);
    req.on("aborted", cleanup);

    try {
      const agent = await agentService.getAgentById(conversation.agentId);
      if (!agent) {
        throw new Error("Agent not found");
      }
      const model = await modelService.getModelById(agent.modelId);
      if (!model) {
        throw new Error("Model not found");
      }
      const llm = new LLM(model);

      const persistentMemoryPromptPatch =
        await memoryManager.getPersistentMemoryPrompt();

      const memoryPromptPatch = await memoryManager.getRelatedMemoryPrompt(
        userMessage
      );

      const prompt = await langfuse.getPrompt(agent.systemPromptId);
      const compiledPrompt = prompt.compile({
        persistentMemory: persistentMemoryPromptPatch,
        onDemandMemory: memoryPromptPatch,
      });

      const systemPrompt = compiledPrompt;

      console.log("[Message] System Prompt", systemPrompt);

      // 11. start streaming
      const { textStream } = await llm.streamText(messages, systemPrompt);

      // 12. stream and collect full response
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
