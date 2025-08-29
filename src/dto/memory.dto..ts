// src/dto/agent.dto.ts
import { z } from "zod";
import { MemorySchema } from '@/prisma/generated/zod'

export const MemorySchemaWithEmbedding = MemorySchema.extend({
  embedding: z.array(z.number()).length(1536),
})

export const CreateMemoryDtoSchema = MemorySchemaWithEmbedding.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateMemoryDtoSchema = MemorySchemaWithEmbedding.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export const DeleteMemoryDtoSchema = z.object({
  id: z.string(),
});

export const CreateMemoryRequestSchema = CreateMemoryDtoSchema.omit({
  userId: true,
  embedding: true,
})

export type CreateMemoryRequestDto = z.infer<typeof CreateMemoryRequestSchema>;

export type MemoryDto = z.infer<typeof MemorySchemaWithEmbedding>;
export type CreateMemoryDto = z.infer<typeof CreateMemoryDtoSchema>;
export type DeleteMemoryDto = z.infer<typeof DeleteMemoryDtoSchema>;

export type UpdateMemoryDto = z.infer<typeof UpdateMemoryDtoSchema>;
