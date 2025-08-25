// src/dto/message.dto.ts
import { z } from "zod";

export const MessageRoleSchema = z.enum(["user", "assistant"]);

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

export const GetMessageChunkRequestSchema = z.object({
  conversation_id: z.string(),
  page: z.string().transform((val) => parseInt(val, 10)),
  limit: z.string().transform((val) => parseInt(val, 10)),
  before_message_id: z.string().optional(), // 用于获取某条消息之前的消息
});

export type MessageDto = z.infer<typeof MessageDtoSchema>;
export type CreateMessageDto = z.infer<typeof CreateMessageDtoSchema>;
export type GetMessageChunkRequest = z.infer<
  typeof GetMessageChunkRequestSchema
>;
