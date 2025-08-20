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

const DeleteConversationSchema = z.object({
  id: z.string(),
});

const handler = async function handler(
  req: ExtendedNextApiRequest,
  res: NextApiResponse
) {
  try {
    const { id } = req.validated as z.infer<typeof DeleteConversationSchema>;
    const userId = req.session.user.id;

    await conversationService.deleteConversation(id, userId);

    return res.status(200).json({
      message: "Conversation deleted successfully",
      code: 0,
    });
  } catch (error) {
    console.error("Conversation delete error:", error);
    return res.status(500).json({
      message: "Failed to delete conversation",
      code: 1,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export default chain(
  withMethods(["DELETE"]),
  withAuth(authOptions),
  withZod(DeleteConversationSchema, "query")
)(handler);
