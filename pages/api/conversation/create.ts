import type { NextApiResponse } from "next";
import {
  CreateConversationDto,
  CreateConversationDtoSchema,
} from "@/src/dto/conversation.dto";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import {
  chain,
  withMethods,
  withAuth,
  withZod,
  ExtendedNextApiRequest,
} from "@/utils/api/handler";
import { conversationService } from "@/src/service/conversation.service";

const handler = async function handler(
  req: ExtendedNextApiRequest,
  res: NextApiResponse
) {
  const conversationData = req.validated as CreateConversationDto;

  try {
    const conversation = await conversationService.createConversation(
      conversationData
    );

    return res.status(201).json({
      message: "Conversation created successfully",
      code: 0,
      data: conversation,
    });
  } catch (error) {
    console.error("Conversation creation error:", error);
    return res.status(500).json({
      message: "Failed to create conversation",
      code: 1,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export default chain(
  withMethods(["POST"]),
  withAuth(authOptions),
  withZod(CreateConversationDtoSchema, "body")
)(handler);
