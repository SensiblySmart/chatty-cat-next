import { streamText, ModelMessage } from "ai";
import { ModelDto } from "@/src/dto/model.dto";
import { getModelByModelName } from "./provider";

class LLM {
  private model: ModelDto;

  constructor(model: ModelDto) {
    this.model = model;
  }

  async streamText(messages: ModelMessage[], systemPrompt: string) {
    const textStream = streamText({
      model: getModelByModelName(this.model.modelName),
      messages: messages,
      system: systemPrompt,
    });

    return textStream;
  }
}

export default LLM;
