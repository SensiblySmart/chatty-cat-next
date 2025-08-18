// src/dto/auth.dto.ts
import { z } from "zod";

export const ModelDtoSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  provider: z.enum(["openai", "deepsseek"]),
  model_name: z.enum(["gpt-4o", "gpt-5", "deepseek-chat"]),
});

export const CreateModelDtoSchema = ModelDtoSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// 自动推导 TypeScript 类型
export type ModelDto = z.infer<typeof ModelDtoSchema>;
export type CreateModelDto = z.infer<typeof CreateModelDtoSchema>;
