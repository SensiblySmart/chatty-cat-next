import { z } from "zod";
import { MessageSchema, RoleSchema } from "@/prisma/generated/zod";

export const MessageRoleSchema = RoleSchema;

export const MessageContentSchema = z.object({
  text: z.string(),
});

// Dto Schema 与表结构完全一致
export const MessageDtoSchema = MessageSchema

export const CreateMessageDtoSchema = MessageDtoSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const SendMessageRequestSchema = CreateMessageDtoSchema.omit({
  senderId: true,
  role: true,
});

export const GetMessageChunkRequestSchema = z.object({
  conversationId: z.string(),
  page: z.string().transform((val) => parseInt(val, 10)),
  limit: z.string().transform((val) => parseInt(val, 10)),
  beforeMessageId: z.string().optional(), // 用于获取某条消息之前的消息
});

export type MessageDto = z.infer<typeof MessageDtoSchema>;
export type CreateMessageDto = z.infer<typeof CreateMessageDtoSchema>;


export type SendMessageRequestDto = z.infer<typeof SendMessageRequestSchema>;

export type GetMessageChunkRequest = z.infer<
  typeof GetMessageChunkRequestSchema
>;
