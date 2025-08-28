import type { NextApiResponse } from "next";
import { GetMessageChunkRequestSchema } from "@/src/dto/message.dto";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import {
  chain,
  withMethods,
  withAuth,
  withZod,
  ExtendedNextApiRequest,
} from "@/utils/api/handler";
import { messageService } from "@/src/service/message.service";
import { z } from "zod";

const handler = async function handler(
  req: ExtendedNextApiRequest,
  res: NextApiResponse
) {
  const queryData = req.validated as z.infer<
    typeof GetMessageChunkRequestSchema
  >;

  try {
    const { conversationId, page, limit, beforeMessageId } = queryData;

    // 获取消息分片
    const result = await messageService.getMessageChunk(
      conversationId,
      page,
      limit,
      beforeMessageId
    );

    return res.status(200).json({
      message: "Messages retrieved successfully",
      code: 0,
      data: {
        messages: result.messages,
        pagination: {
          page,
          limit,
          total: result.total,
          hasMore: result.hasMore,
          totalPages: Math.ceil(result.total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Message chunk retrieval error:", error);
    return res.status(500).json({
      message: "Failed to retrieve messages",
      code: 1,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export default chain(
  withMethods(["GET"]),
  withAuth(authOptions),
  withZod(GetMessageChunkRequestSchema, "query")
)(handler);
