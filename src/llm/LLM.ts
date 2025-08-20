import { streamText, ModelMessage, LanguageModel } from "ai";
import { ModelDto } from "@/src/dto/model.dto";
import { env } from "@/utils/env";
import MemoryClient, { Memory, Message } from "mem0ai";
import { gpt4o } from "./provider";
import { createMem0, Mem0Provider } from "@mem0/vercel-ai-provider";

class LLM {
  private model: ModelDto;
  private mem0: Mem0Provider;
  private userId: string;

  constructor(model: ModelDto, userId: string) {
    this.model = model;

    // this.mem0 = new MemoryClient({ apiKey: env.MEM0_API_KEY });
    this.mem0 = createMem0({
      provider: "openai",
      mem0Config: {
        user_id: userId,
      },
    });
    this.userId = userId;
  }

  async streamText(messages: Message[], systemPrompt: string) {
    const textStream = streamText({
      model: this.mem0(this.model.model_name, { top_k: 3 }),
      messages: messages as ModelMessage[],
      system: systemPrompt,
    });

    return textStream;
  }

  private async appendMemoryToSystemPrompt(system: string, memories: Memory[]) {
    const memoryTexts = memories.map((m) => m.memory).join("\n");
    return `${system}\n\n${memoryTexts}`;
  }
}

export default LLM;
