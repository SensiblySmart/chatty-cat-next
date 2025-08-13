// src/dto/message.dto.ts
import { z } from "zod";

export const MessageRoleSchema = z.enum(["system", "user", "agent"]);

export const MessageContentSchema = z.object({
  text: z.string(),
});

// Dto Schema 与表结构完全一致
export const MessageDtoSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  conversation_id: z.string(),
  sender_id: z.string(),
  role: MessageRoleSchema,
  content: MessageContentSchema,
});

export const CreateMessageDtoSchema = MessageDtoSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const SendMessageRequestSchema = CreateMessageDtoSchema.omit({
  sender_id: true,
  role: true,
});

export type MessageDto = z.infer<typeof MessageDtoSchema>;
export type CreateMessageDto = z.infer<typeof CreateMessageDtoSchema>;
