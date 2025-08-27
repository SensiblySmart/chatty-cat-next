import { detectMemoryTrigger, extractMemoryFact } from "@/src/llm/helper";
import MemoryClient from "mem0ai";
import { env } from "@/utils/env";
import { MessageDto } from "@/src/dto/message.dto";

export default class MemoryManager {
  private mem0: MemoryClient;
  private userId: string;

  constructor(userId: string) {
    this.mem0 = new MemoryClient({ apiKey: env.MEM0_API_KEY });
    this.userId = userId;
  }

  public async processUserMessage(userMessage: MessageDto): Promise<void> {
    const shouldRemember = await detectMemoryTrigger(userMessage.content.text);
    console.log("[MemoryManager] Memory trigger detect Result", shouldRemember);

    if (shouldRemember.should_remember) {
      // 这里要先查一下，数据库里是不是已有相同的记忆，如果有，不要重复写

      console.log("[MemoryManager] Extracting memory fact");
      const memoryFact = await extractMemoryFact(userMessage.content.text);
      console.log("[MemoryManager] Memory fact extracted", memoryFact);
      const memory = await this.mem0.add(
        [
          {
            role: "user",
            content: memoryFact.fact,
          },
        ],
        {
          user_id: this.userId,
          version: "v2",
          custom_categories: [
            {
              [memoryFact.category]: memoryFact.category,
            },
          ],
          metadata: {
            source_message_id: userMessage.id,
          },
          infer: false,
        }
      );
      console.log("[MemoryManager] Memory added", memory);
    }
  }

  public async getPersistentMemoryPrompt(): Promise<string> {
    const memories = await this.mem0.getAll({
      user_id: this.userId,
      version: "v2",
      filters: {
        categories: ["identity"],
      },
    });
    console.log("[MemoryManager] Memories", memories);

    const patch = memories
      .map((memory) => {
        return memory.memory;
      })
      .join("\n");

    return patch;
  }
}
