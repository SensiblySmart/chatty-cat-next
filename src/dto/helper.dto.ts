import { z } from "zod";

export const GenerateTitleDtoSchema = z.object({
  text: z.string(),
});

// 自动推导 TypeScript 类型
export type GenerateTitleDto = z.infer<typeof GenerateTitleDtoSchema>;
