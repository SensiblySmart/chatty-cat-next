import { streamText, ModelMessage, LanguageModel } from "ai";
import { ModelDto } from "@/src/dto/model.dto";
import { env } from "@/utils/env";
import MemoryClient, { Memory, Message } from "mem0ai";
import { gpt4o } from "./provider";

class LLM {
  private model: ModelDto;
  private mem0: MemoryClient;
  private userId: string;

  constructor(model: ModelDto, userId: string) {
    this.model = model;

    this.mem0 = new MemoryClient({ apiKey: env.MEM0_API_KEY });
    this.userId = userId;
  }

  async streamText(messages: Message[], systemPrompt: string) {
    console.log("Messages: ", messages);
    const memory = await this.mem0.search(
      messages.findLast((msg) => msg.role === "user")?.content as string,
      {
        user_id: this.userId,
      }
    );

    console.log("Related memory: ", memory);

    const textStream = streamText({
      model: gpt4o,
      messages: messages as ModelMessage[],
      system: await this.appendMemoryToSystemPrompt(systemPrompt, memory),
    });

    return textStream;
  }

  private async appendMemoryToSystemPrompt(system: string, memories: Memory[]) {
    const memoryTexts = memories.map((m) => m.memory).join("\n");
    return `${system}\n\n${memoryTexts}`;
  }
}

export default LLM;
