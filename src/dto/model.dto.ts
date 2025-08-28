// src/dto/auth.dto.ts
import { z } from "zod";
import { ModelSchema } from "@/prisma/generated/zod";


export const CreateModelDtoSchema = ModelSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// 自动推导 TypeScript 类型
export type ModelDto = z.infer<typeof ModelSchema>;
export type CreateModelDto = z.infer<typeof CreateModelDtoSchema>;
