import { streamText, ModelMessage, LanguageModel } from "ai";
import { gpt4o, gpt5, deepseekChat } from "./provider";
import { ModelDto } from "@/src/dto/model.dto";

const ModelMap: Record<ModelDto["model_name"], LanguageModel> = {
  "gpt-4o": gpt4o,
  "gpt-5": gpt5,
  "deepseek-chat": deepseekChat,
};

class LLM {
  private model: LanguageModel;

  constructor(modelName: ModelDto["model_name"]) {
    this.model = ModelMap[modelName];
    console.log("model", this.model);
  }

  async streamText(messages: ModelMessage[]) {
    const textStream = streamText({
      model: this.model,
      messages,
    });

    return textStream;
  }
}

export default LLM;
