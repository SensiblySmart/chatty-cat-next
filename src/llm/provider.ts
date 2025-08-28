import { openai } from "@ai-sdk/openai";
import { ModelDto } from "../dto/model.dto";

export const gpt4o = openai("gpt-4o");
export const gpt5 = openai("gpt-5");
// TODO: change to deepseek-chat
export const deepseekChat = openai("gpt-5");

export const getModelByModelName = (modelName: ModelDto["modelName"]) => {
  switch (modelName) {
    case "gpt-4o":
      return gpt4o;
    case "gpt-5":
      return gpt5;
    case "deepseek-chat":
      return gpt4o;

    default:
      return gpt4o
  }
};
