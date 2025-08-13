import type { NextApiResponse } from "next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import {
  chain,
  withMethods,
  withAuth,
  ExtendedNextApiRequest,
} from "@/utils/api/handler";
import { conversationService } from "@/pages/service/conversation.service";

const handler = async function handler(
  req: ExtendedNextApiRequest,
  res: NextApiResponse
) {
  try {
    const conversations = await conversationService.listAllConversations();

    return res.status(200).json({
      message: "Conversations retrieved successfully",
      code: 0,
      data: conversations,
    });
  } catch (error) {
    console.error("Conversation list error:", error);
    return res.status(500).json({
      message: "Failed to retrieve conversations",
      code: 1,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export default chain(withMethods(["GET"]), withAuth(authOptions))(handler);
