import db from "./db";
import { CreateMemoryDto, MemoryDto } from "../dto/memory";

class MemoryService {
  private static instance: MemoryService;

  private constructor() {}

  public static getInstance(): MemoryService {
    if (!MemoryService.instance) {
      MemoryService.instance = new MemoryService();
    }
    return MemoryService.instance;
  }

  async createMemory(data: CreateMemoryDto): Promise<MemoryDto> {
    const { data: result, error } = await db
      .getClient()
      .from("memories")
      .insert({
        ...data,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create memory: ${error.message}`);
    }

    return result as MemoryDto;
  }
}

export const memoryService = MemoryService.getInstance();
export default memoryService;
