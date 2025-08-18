import { openai } from "@ai-sdk/openai";

export const gpt4o = openai("gpt-4o");
export const gpt5 = openai("gpt-5");
// TODO: change to deepseek-chat
export const deepseekChat = openai("gpt-5");
