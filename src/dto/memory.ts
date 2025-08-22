import { z } from "zod";

export const MemoryDtoSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  category: z.enum([
    "preference",
    "event",
    "personality",
    "rule",
    "emotion",
    "other",
  ]),
  content: z.string(),
  embedding: z.array(z.number()),
  importance: z.number(),
});

export const CreateModelDtoSchema = MemoryDtoSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type MemoryDto = z.infer<typeof MemoryDtoSchema>;
export type CreateMemoryDto = z.infer<typeof CreateModelDtoSchema>;
