import type { NextApiResponse } from "next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import {
  chain,
  withMethods,
  withAuth,
  withZod,
  ExtendedNextApiRequest,
} from "@/utils/api/handler";
import { CreateMemoryRequestSchema, CreateMemoryRequestDto } from "@/src/dto/memory.dto.";
import { z } from "zod";
import { memoryService } from "@/src/service/memory.service";
import { createEmbedding } from '@/src/llm/helper'



const handler = async function handler(
  req: ExtendedNextApiRequest,
  res: NextApiResponse
) {
  const { content } = req.validated as CreateMemoryRequestDto;

  try {
    const embedding = await createEmbedding(content);

    const memory = await memoryService.createMemory({
      userId: req.session.user.id,
      content,
      embedding,
    });

    return res.status(201).json({
      message: "Memory created successfully",
      code: 0,
      data: memory,
    });
  } catch (error) {
    console.error("Memory creation error:", error);
    return res.status(500).json({
      message: "Failed to create memory",
      code: 1,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export default chain(
  withMethods(["POST"]),
  withAuth(authOptions),
  withZod(CreateMemoryRequestSchema, "body")
)(handler);
