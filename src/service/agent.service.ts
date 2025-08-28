import { AgentDto, CreateAgentDto, UpdateAgentDto } from "@/src/dto/agent.dto";
import db from "./db";
import { prisma }from '@/prisma'
import { Agent } from '@prisma/client'

class AgentService {
  private static instance: AgentService;

  private constructor() {}

  public static getInstance(): AgentService {
    if (!AgentService.instance) {
      AgentService.instance = new AgentService();
    }
    return AgentService.instance;
  }

  /**
   * 创建新的 agent 记录
   */
  async createAgent(data: CreateAgentDto): Promise<Agent> {
    const agent = await prisma.agent.create({
      data: {
        displayName: data.displayName,
        description: data.description,
        avatarUrl: data.avatarUrl,
        modelId: data.modelId,
        systemPromptId: data.systemPromptId,
      },
    });


    return agent;
  }

  /**
   * 获取所有 agent 记录
   */
  async listAllAgents(): Promise<Agent[]> {
    const agents = await prisma.agent.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return agents;
  }

  /**
   * 根据 ID 获取 agent
   */
  async getAgentById(id: string): Promise<Agent | null> {
    const agent = await prisma.agent.findUnique({
      where: {
        id,
      },
    });
    return agent;
  }

  /**
   * 更新 agent
   */
  async updateAgent(id: string, data: UpdateAgentDto): Promise<Agent> {
    const agent = await prisma.agent.update({
      where: {
        id,
      },
      data: data,
    });

    return agent;
  }

  /**
   * 删除 agent
   */
  async deleteAgent(id: string): Promise<void> {
    await prisma.agent.delete({
      where: {
        id,
      },
    });
  }
}

export const agentService = AgentService.getInstance();
export default agentService;
