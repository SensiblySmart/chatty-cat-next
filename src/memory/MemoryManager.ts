import { detectMemoryTrigger, extractMemoryFact } from "@/src/llm/helper";
import { env } from "@/utils/env";
import { MessageDto } from "@/src/dto/message.dto";
import { Langfuse } from "langfuse";
import { generateObject, generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { ModelMessage } from 'ai'

export default class MemoryManager {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  public async processRecentMessages(messages: ModelMessage[]): Promise<void> {
    // extract facts from recent messages

    // process retrieved facts with previous memories to determine how to handle them

    // handle retrieved facts accordingly
  }

  public async getPersistentMemoryPrompt(): Promise<string> {
    return '';
  }

  public async getRelatedMemoryPrompt(
    userMessage: MessageDto
  ): Promise<string> {
    const langfuse = new Langfuse({});
    const prompt = await langfuse.getPrompt("CheckShouldQueryMemoryPrompt");
    const compiledPrompt = prompt.compile({
      message: userMessage.content,
    });
    return ''
  }
}
