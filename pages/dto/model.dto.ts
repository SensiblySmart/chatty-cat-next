// src/dto/auth.dto.ts
import { z } from "zod";

export const ModelDtoSchema = z.object({
  provider: z.string(),
  model_name: z.string(),
});
// 自动推导 TypeScript 类型
export type ModelDto = z.infer<typeof ModelDtoSchema>;
