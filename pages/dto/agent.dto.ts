// src/dto/agent.dto.ts
import { z } from "zod";

// Dto Schema 与表结构完全一致
export const AgentDtoSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  display_name: z.string(),
  description: z.string(),
  avatar_url: z.string(),
  model_id: z.string(),
  system_prompt: z.string(),
});

export const CreateAgentDtoSchema = AgentDtoSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// 自动推导 TypeScript 类型
export type AgentDto = z.infer<typeof AgentDtoSchema>;
export type CreateAgentDto = z.infer<typeof CreateAgentDtoSchema>;
