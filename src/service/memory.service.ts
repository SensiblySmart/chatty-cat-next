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

}

export const memoryService = MemoryService.getInstance();
export default memoryService;
