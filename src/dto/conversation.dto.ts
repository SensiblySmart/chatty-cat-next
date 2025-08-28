import { z } from "zod";
import { ConversationSchema } from "@/prisma/generated/zod";

export const CreateConversationDtoSchema = ConversationSchema.omit({
  createdAt: true,
  updatedAt: true,
  lastMessageAt: true,
  title: true,
  isDeleted: true,
});

export const CreateConversatioRequestSchema = ConversationSchema.omit({
  createdAt: true,
  updatedAt: true,
  lastMessageAt: true,
  title: true,
  userId: true,
  isDeleted: true,
});

// 自动推导 TypeScript 类型
export type ConversationDto = z.infer<typeof ConversationSchema>;
export type CreateConversationDto = z.infer<typeof CreateConversationDtoSchema>;
export type CreateConversationRequestDto = z.infer<
  typeof CreateConversatioRequestSchema
>;
