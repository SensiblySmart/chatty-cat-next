// src/dto/conversation.dto.ts
import { z } from "zod";

// Dto Schema 与表结构完全一致
export const ConversationEntitySchema = z.object({
  id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  last_message_at: z.string(),
  title: z.string(),
  agent_id: z.string(),
  user_id: z.string(),
});

export const CreateConversationDtoSchema = ConversationEntitySchema.omit({
  created_at: true,
  updated_at: true,
  last_message_at: true,
  title: true,
});

export const CreateConversatioRequestSchema = ConversationEntitySchema.omit({
  created_at: true,
  updated_at: true,
  last_message_at: true,
  title: true,
  user_id: true,
});

// 自动推导 TypeScript 类型
export type ConversationDto = z.infer<typeof ConversationEntitySchema>;
export type CreateConversationDto = z.infer<typeof CreateConversationDtoSchema>;
export type CreateConversationRequest = z.infer<
  typeof CreateConversatioRequestSchema
>;
