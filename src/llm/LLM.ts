import { streamText, ModelMessage } from "ai";
import { gpt4o } from "./provider";

class LLM {
  private static instance: LLM;

  private constructor() {}

  public static getInstance(): LLM {
    if (!LLM.instance) {
      LLM.instance = new LLM();
    }
    return LLM.instance;
  }

  async streamText(messages: ModelMessage[]) {
    const textStream = streamText({
      model: gpt4o,
      messages,
    });

    return textStream;
  }
}

export const llm = LLM.getInstance();
export default llm;
