import { streamText, ModelMessage, LanguageModel } from "ai";
import { ModelDto } from "@/src/dto/model.dto";
import { env } from "@/utils/env";
import MemoryClient, { Memory, Message } from "mem0ai";
import { getModelByModelName } from "./provider";

class LLM {
  private model: ModelDto;

  constructor(model: ModelDto) {
    this.model = model;
  }

  async streamText(messages: Message[], systemPrompt: string) {
    const textStream = streamText({
      model: getModelByModelName(this.model.model_name),
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
