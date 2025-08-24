import { memoryService } from "../service/memory.service";
import { createEmbedding, evaluateMessageForMemorizing } from "./helper";
import { MessageContent } from "@/src/dto/message.dto";
import { MemoryDto } from "@/src/dto/memory.dto";

class Memory {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async addMemoryIfNeeded(messageContent: MessageContent) {
    // check whether the content worth memorizing
    const result = await evaluateMessageForMemorizing(messageContent.text);

    console.log("[/llm/Memory] evaluateMessageForMemorizing result", result);

    if (!result.should_memorize) {
      return;
    }

    // create embedding
    const embedding = await createEmbedding(messageContent.text);
    const { importance, catagory, content } = result;
    // If model declined to memorize, the early return above already handled it.
    // Here catagory is guaranteed by schema to be one of the enum values when should_memorize=true.

    // save memory
    const memory = await memoryService.createMemory({
      user_id: this.userId,
      content,
      embedding,
      category: catagory as MemoryDto["category"],
      importance,
    });

    return memory;
  }

  async searchMemory(query: string) {
    const memories = await memoryService.searchMemory(query);
    return memories.map((memory) => memory.memory);
  }
}

export default Memory;
