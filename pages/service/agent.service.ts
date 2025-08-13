import { AgentDto, CreateAgentDto } from "@/pages/dto/agent.dto";
import db from "./db";

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
  async createAgent(data: CreateAgentDto): Promise<AgentDto> {
    const { data: result, error } = await db
      .getClient()
      .from("agents")
      .insert({
        ...data,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create agent: ${error.message}`);
    }

    return result as AgentDto;
  }

  /**
   * 获取所有 agent 记录
   */
  async listAllAgents(): Promise<AgentDto[]> {
    const { data: result, error } = await db
      .getClient()
      .from("agents")
      .select("*")
      .limit(100);

    if (error) {
      throw new Error(`Failed to list agents: ${error.message}`);
    }

    return result as AgentDto[];
  }

  /**
   * 根据 ID 获取 agent
   */
  async getAgentById(id: string): Promise<AgentDto | null> {
    const { data: result, error } = await db
      .getClient()
      .from("agents")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // No rows returned
      }
      throw new Error(`Failed to get agent: ${error.message}`);
    }

    return result as AgentDto;
  }
}

export const agentService = AgentService.getInstance();
export default agentService;
