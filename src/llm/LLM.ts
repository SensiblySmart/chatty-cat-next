import { streamText, ModelMessage, LanguageModel } from "ai";
import { gpt4o, gpt5, deepseekChat } from "./provider";
import { ModelDto } from "@/src/dto/model.dto";
import { createMem0, Mem0Provider } from "@mem0/vercel-ai-provider";
import { env } from "@/utils/env";

class LLM {
  private model: ModelDto;
  private mem0: Mem0Provider;

  constructor(model: ModelDto, userId: string) {
    this.model = model;

    this.mem0 = createMem0({
      provider: "openai",
      mem0ApiKey: env.MEM0_API_KEY,
      apiKey: env.OPENAI_API_KEY,
      config: {
        // Options for LLM Provider
      },
      mem0Config: {
        user_id: userId,
      },
    });
  }

  async streamText(messages: ModelMessage[]) {
    const textStream = streamText({
      model: this.mem0(this.model.model_name),
      messages,
    });

    return textStream;
  }
}

export default LLM;
