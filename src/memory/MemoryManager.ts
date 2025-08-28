import { detectMemoryTrigger, extractMemoryFact } from "@/src/llm/helper";
import MemoryClient, { Message } from "mem0ai";
import { env } from "@/utils/env";
import { MessageDto } from "@/src/dto/message.dto";
import { Langfuse } from "langfuse";
import { generateObject, generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

export default class MemoryManager {
  private mem0: MemoryClient;
  private userId: string;

  constructor(userId: string) {
    this.mem0 = new MemoryClient({ apiKey: env.MEM0_API_KEY });
    this.userId = userId;
  }

  public async processUserMessages(messages: Message[]): Promise<void> {
    // const shouldRemember = await detectMemoryTrigger(userMessage.content.text);
    // console.log("[MemoryManager] Memory trigger detect Result", shouldRemember);

    // if (shouldRemember.should_remember) {
    //   // 这里要先查一下，数据库里是不是已有相同的记忆，如果有，不要重复写

    //   console.log("[MemoryManager] Extracting memory fact");
    //   const memoryFact = await extractMemoryFact(userMessage.content.text);
    //   console.log("[MemoryManager] Memory fact extracted", memoryFact);

    // get last 10 messages
    const last10Messages = messages.slice(
      messages.length - 10,
      messages.length
    );

    const memory = await this.mem0.add(
      last10Messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        user_id: this.userId,
        version: "v2",
        infer: true,
      }
    );
    console.log("[MemoryManager] Memory added", memory);
  }

  public async getPersistentMemoryPrompt(): Promise<string> {
    const persistentCategories = ["identity", "boundaries", "communication"];

    const results = await Promise.all(
      persistentCategories.map(async (category) => {
        return await this.mem0.getAll({
          api_version: "v2",
          filters: {
            AND: [
              { user_id: this.userId },
              { metadata: { category: category } },
            ],
          },
        });
      })
    );

    const memories = results
      .flat()
      .map((result) => result?.memory)
      .filter((result) => result !== undefined);

    const patch = memories.join("\n");
    console.log("[MemoryManager] PersistentMemoryPrompt", patch);

    return patch;
  }

  public async getRelatedMemoryPrompt(
    userMessage: MessageDto
  ): Promise<string> {
    const langfuse = new Langfuse({});
    const prompt = await langfuse.getPrompt("CheckShouldQueryMemoryPrompt");
    const compiledPrompt = prompt.compile({
      message: userMessage.content,
    });

    const result = await generateObject({
      model: openai("gpt-4o-mini"),
      prompt: compiledPrompt,
      schema: z.object({
        should_query: z.boolean(),
        query_question: z.string(),
      }),
    });
    console.log("[MemoryManager] RelatedMemoryPrompt", result.object);

    if (result.object.should_query) {
      const memSearchResult = await this.mem0.search(
        result.object.query_question,
        {
          user_id: this.userId,
          top_k: 3,
          api_version: "v2",
          filters: {
            AND: [{ user_id: this.userId }],
          },
        }
      );

      console.log("[MemoryManager] Memory search result", memSearchResult);

      return memSearchResult.map((mem) => mem.memory).join("\n");
    } else {
      return "";
    }
  }
}
