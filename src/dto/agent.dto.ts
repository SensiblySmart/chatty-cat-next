// src/dto/agent.dto.ts
import { z } from "zod";
import { AgentSchema } from '@/prisma/generated/zod'

export const CreateAgentDtoSchema = AgentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateAgentDtoSchema = AgentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export const UpdateAgentRequestDtoSchema = AgentSchema.pick({ id: true }).merge(
  UpdateAgentDtoSchema
);

export const DeleteAgentDtoSchema = z.object({
  id: z.string(),
});

// 自动推导 TypeScript 类型
export type AgentDto = z.infer<typeof AgentSchema>;
export type CreateAgentDto = z.infer<typeof CreateAgentDtoSchema>;
export type DeleteAgentDto = z.infer<typeof DeleteAgentDtoSchema>;

export type UpdateAgentDto = z.infer<typeof UpdateAgentDtoSchema>;
export type UpdateAgentRequestDto = z.infer<typeof UpdateAgentRequestDtoSchema>;
