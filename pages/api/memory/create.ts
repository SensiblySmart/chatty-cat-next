import type { NextApiResponse } from "next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import {
  chain,
  withMethods,
  withAuth,
  withZod,
  ExtendedNextApiRequest,
} from "@/utils/api/handler";
import { z } from "zod";
import { MemoryDtoSchema } from "@/src/dto/memory";
import {
  createEmbedding,
  evaluateMessageForMemorizing,
} from "@/src/llm/helper";
import memoryService from "@/src/service/memory.service";

const CreateMemoryRequestSchema = z.object({
  content: z.object({
    text: z.string(),
  }),
});

const handler = async function handler(
  req: ExtendedNextApiRequest,
  res: NextApiResponse
) {
  try {
    const {
      content: { text },
    } = req.validated as z.infer<typeof CreateMemoryRequestSchema>;

    // check whether the content worth memorizing
    const result = await evaluateMessageForMemorizing(text);

    console.log(
      "[/api/memory/create] evaluateMessageForMemorizing result",
      result
    );

    if (!result.should_memorize) {
      return res.status(200).json({
        message: "Memory not worth memorizing",
        code: 0,
      });
    }

    // create embedding
    const embedding = await createEmbedding(text);
    const { importance, catagory, content } = result;
    // If model declined to memorize, the early return above already handled it.
    // Here catagory is guaranteed by schema to be one of the enum values when should_memorize=true.

    // save memory
    const memory = await memoryService.createMemory({
      user_id: req.session.user.id,
      content,
      embedding,
      category: catagory as z.infer<typeof MemoryDtoSchema>["category"],
      importance,
    });

    return res.status(200).json({
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
