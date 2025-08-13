import {
  ConversationDto,
  CreateConversationDto,
} from "@/src/dto/conversation.dto";
import db from "./db";

class ConversationService {
  private static instance: ConversationService;

  private constructor() {}

  public static getInstance(): ConversationService {
    if (!ConversationService.instance) {
      ConversationService.instance = new ConversationService();
    }
    return ConversationService.instance;
  }

  /**
   * 创建新的 conversation 记录
   */
  async createConversation(
    data: CreateConversationDto
  ): Promise<ConversationDto> {
    const { data: result, error } = await db
      .getClient()
      .from("conversations")
      .insert({
        ...data,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create conversation: ${error.message}`);
    }

    return result as ConversationDto;
  }

  /**
   * 获取所有 conversation 记录
   */
  async listAllConversations(): Promise<ConversationDto[]> {
    const { data: result, error } = await db
      .getClient()
      .from("conversations")
      .select("*")
      .limit(100)
      .order("last_message_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to list conversations: ${error.message}`);
    }

    return result as ConversationDto[];
  }

  /**
   * 根据 ID 获取 conversation
   */
  async getConversationById(id: string): Promise<ConversationDto | null> {
    const { data: result, error } = await db
      .getClient()
      .from("conversations")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // No rows returned
      }
      throw new Error(`Failed to get conversation: ${error.message}`);
    }

    return result as ConversationDto;
  }

  /**
   * 根据 agent_id 获取 conversations
   */
  async getConversationsByAgentId(agentId: string): Promise<ConversationDto[]> {
    const { data: result, error } = await db
      .getClient()
      .from("conversations")
      .select("*")
      .eq("agent_id", agentId)
      .order("last_message_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to get conversations by agent: ${error.message}`);
    }

    return result as ConversationDto[];
  }

  /**
   * 更新 conversation 的最后消息时间
   */
  async updateLastMessageTime(id: string): Promise<ConversationDto> {
    const { data: result, error } = await db
      .getClient()
      .from("conversations")
      .update({
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update conversation: ${error.message}`);
    }

    return result as ConversationDto;
  }
}

export const conversationService = ConversationService.getInstance();
export default conversationService;
