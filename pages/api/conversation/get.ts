import type { NextApiResponse } from "next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import {
  chain,
  withMethods,
  withAuth,
  ExtendedNextApiRequest,
  withZod,
} from "@/utils/api/handler";
import { conversationService } from "@/src/service/conversation.service";
import { z } from "zod";

const GetConversationSchema = z.object({
  id: z.string(),
});

const handler = async function handler(
  req: ExtendedNextApiRequest,
  res: NextApiResponse
) {
  try {
    const { id } = req.validated as z.infer<typeof GetConversationSchema>;
    const conversation = await conversationService.getConversationById(id);

    return res.status(200).json({
      message: "Conversation retrieved successfully",
      code: 0,
      data: conversation,
    });
  } catch (error) {
    console.error("Conversation get error:", error);
    return res.status(500).json({
      message: "Failed to retrieve conversation",
      code: 1,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export default chain(
  withMethods(["GET"]),
  withAuth(authOptions),
  withZod(GetConversationSchema, "query")
)(handler);
