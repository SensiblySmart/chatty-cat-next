import { MemoryDto, CreateMemoryDto } from "@/src/dto/memory.dto.";
import { prisma } from '@/prisma'

class MemoryService {
  private static instance: MemoryService;

  private constructor() {}

  public static getInstance(): MemoryService {
    if (!MemoryService.instance) {
      MemoryService.instance = new MemoryService();
    }
    return MemoryService.instance;
  }

  /**
   * 创建新的 message 记录
   */
  async createMemory(data: CreateMemoryDto) {
    if (data.embedding.length !== 1536) {
      throw new Error("Embedding length must be 1536");
    }

    await prisma.$executeRawUnsafe(
      `
      INSERT INTO "memories" ("id", "user_id", "content", "updated_at", "embedding")
      VALUES (gen_random_uuid(), $1, $2, now(), $3::vector)
      `,
      data.userId,
      data.content,
      `[${data.embedding.join(",")}]`
    )
  }

  async searchSimilarMemories(queryEmbedding: number[], userId: string, limit = 5) {

    if (queryEmbedding.length !== 1536) {
      throw new Error("Embedding length must be 1536");
    }

    const result = await prisma.$queryRawUnsafe<MemoryDto[]>(
      `
      SELECT id, content, embedding <=> $1::vector AS distance, 1 - (embedding <=> $1::vector) AS similarity
      FROM "memories"
      WHERE "user_id" = $2
      ORDER BY embedding <=> $1::vector
      LIMIT $3
      `,
      `[${queryEmbedding.join(",")}]`, // $1
      userId,                          // $2
      limit                            // $3
    )
    return result
  }

}

export const memoryService = MemoryService.getInstance();
export default memoryService;
