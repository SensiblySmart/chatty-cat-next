// src/dto/conversation.dto.ts
import { z } from "zod";

// Dto Schema 与表结构完全一致
export const ConversationDtoSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  last_message_at: z.string(),
  title: z.string(),
  agent_id: z.string(),
});

export const CreateConversationDtoSchema = ConversationDtoSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  last_message_at: true,
  title: true,
});

// 自动推导 TypeScript 类型
export type ConversationDto = z.infer<typeof ConversationDtoSchema>;
export type CreateConversationDto = z.infer<typeof CreateConversationDtoSchema>;
