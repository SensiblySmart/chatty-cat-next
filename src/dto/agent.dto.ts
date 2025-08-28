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
  langfuse_prompt_id: z.string(),
});

export const CreateAgentDtoSchema = AgentDtoSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const UpdateAgentDtoSchema = z.object({
  id: z.string(),
  display_name: z.string().optional(),
  description: z.string().optional(),
  avatar_url: z.string().optional(),
  model_id: z.string().optional(),
  system_prompt: z.string().optional(),
  langfuse_prompt_id: z.string().optional(),
});

export const DeleteAgentDtoSchema = z.object({
  id: z.string(),
});

// 自动推导 TypeScript 类型
export type AgentDto = z.infer<typeof AgentDtoSchema>;
export type CreateAgentDto = z.infer<typeof CreateAgentDtoSchema>;
export type UpdateAgentDto = z.infer<typeof UpdateAgentDtoSchema>;
export type DeleteAgentDto = z.infer<typeof DeleteAgentDtoSchema>;
