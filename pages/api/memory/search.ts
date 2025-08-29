import type { NextApiResponse } from "next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import {
  chain,
  withMethods,
  withAuth,
  withZod,
  ExtendedNextApiRequest,
} from "@/utils/api/handler";
import { SearchMemoryRequestSchema, SearchMemoryRequestDto } from "@/src/dto/memory.dto.";
import { memoryService } from "@/src/service/memory.service";
import { createEmbedding } from '@/src/llm/helper'



const handler = async function handler(
  req: ExtendedNextApiRequest,
  res: NextApiResponse
) {
  const { content, limit = 5 } = req.validated as SearchMemoryRequestDto;

  try {
    const queryEmbedding = await createEmbedding(content);

    const memories = await memoryService.searchSimilarMemories(
      queryEmbedding,
      req.session.user.id,
      limit,
    );

    return res.status(201).json({
      message: "Memory search successfully",
      code: 0,
      data: memories,
    });
  } catch (error) {
    console.error("Memory search error:", error);
    return res.status(500).json({
      message: "Failed to search memory",
      code: 1,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export default chain(
  withMethods(["GET"]),
  withAuth(authOptions),
  withZod(SearchMemoryRequestSchema, "query")
)(handler);
