import type { NextApiResponse } from "next";
import { SendMessageRequestSchema } from "@/pages/dto/message.dto";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import {
  chain,
  withMethods,
  withAuth,
  withZod,
  ExtendedNextApiRequest,
} from "@/utils/api/handler";
import { messageService } from "../../service/message.service";
import { conversationService } from "@/pages/service/conversation.service";
import { z } from "zod";

const handler = async function handler(
  req: ExtendedNextApiRequest,
  res: NextApiResponse
) {
  const messageData = req.validated as z.infer<typeof SendMessageRequestSchema>;
  const userId = req.session.user.id;

  try {
    // 创建消息，使用当前用户作为 sender_id
    const message = await messageService.createMessage({
      ...messageData,
      role: "user", // 接口创建的 必定为用户发送的消息
      sender_id: userId,
    });

    await conversationService.updateLastMessageTime(
      messageData.conversation_id
    );

    return res.status(201).json({
      message: "Message sent successfully",
      code: 0,
      data: message,
    });
  } catch (error) {
    console.error("Message send error:", error);
    return res.status(500).json({
      message: "Failed to send message",
      code: 1,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export default chain(
  withMethods(["POST"]),
  withAuth(authOptions),
  withZod(SendMessageRequestSchema, "body")
)(handler);
