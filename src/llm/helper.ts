import { generateText, embed, generateObject } from "ai";
import { gpt4o } from "./provider";
import { openai } from "@ai-sdk/openai";
import { Message } from "mem0ai";
import { z } from "zod";
import { memoryClassifierAndSummarizerPrompt } from "@/src/prompt/memory";
import { memoryTriggerDetectorPrompt } from "@/src/prompt/MemoryTriggerDetectorPrompt";

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

export const createEmbedding = async (text: string) => {
  const { embedding } = await embed({
    model: openai.textEmbeddingModel("text-embedding-3-small"),
    value: text,
  });
  return embedding;
};

export const evaluateMessageForMemorizing = async (content: string) => {
  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: z.object({
      importance: z.number().int().min(0).max(5),
      catagory: z
        .union([
          z.enum([
            "preference",
            "event",
            "personality",
            "rule",
            "emotion",
            "other",
          ]),
          z.literal(""),
        ])
        .optional(),
      content: z.string(),
      should_memorize: z.boolean(),
    }),
    system: memoryClassifierAndSummarizerPrompt,
    prompt: content,
  });
  return object;
};

export const detectMemoryTrigger = async (content: string) => {
  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: z.object({
      should_remember: z.boolean(),
      trigger_type: z.enum([
        "Explicit",
        "Repetition",
        "Aspirations",
        "Correction",
        "EmotionalSalience",
        "ContextualContinuity",
        "None",
      ]),
    }),
    system: memoryTriggerDetectorPrompt,
    prompt: content,
  });
  return object;
};

export const extractMemoryFact = async (content: string) => {
  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: z.object({
      category: z.enum([
        "Identity",
        "Preferences",
        "Communication",
        "MoodPatterns",
        "Boundaries",
        "RelationshipHistory",
        "PersonalSymbols",
        "Aspirations",
        "Other",
      ]),
      fact: z.string(),
    }),
    system: memoryTriggerDetectorPrompt,
    prompt: content,
  });
  return object;
};
