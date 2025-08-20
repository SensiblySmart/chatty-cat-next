import { generateText } from "ai";
import { gpt4o } from "./provider";
import { Message } from "mem0ai";

export const generateTitle = async (messages: Message[]) => {
  const result = await generateText({
    model: gpt4o,
    system:
      "Given a single sentence, summarize its core message in no more than 5 words. Use plain English, no punctuation, no extra commentary. Do not add new information. If the input is already ≤5 words, return it unchanged. Output only the summary.",
    messages: [
      {
        role: "user",
        content: messages.map((msg) => msg.content).join("\n"),
      },
    ],
  });
  return result.text;
};
