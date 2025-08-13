import { MessageDto, CreateMessageDto } from "@/pages/dto/message.dto";
import db from "./db";

class MessageService {
  private static instance: MessageService;

  private constructor() {}

  public static getInstance(): MessageService {
    if (!MessageService.instance) {
      MessageService.instance = new MessageService();
    }
    return MessageService.instance;
  }

  /**
   * 创建新的 message 记录
   */
  async createMessage(data: CreateMessageDto): Promise<MessageDto> {
    const { data: result, error } = await db
      .getClient()
      .from("messages")
      .insert({
        ...data,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create message: ${error.message}`);
    }

    return result as MessageDto;
  }

  /**
   * 根据 conversation_id 获取所有消息
   */
  async getMessagesByConversationId(
    conversationId: string
  ): Promise<MessageDto[]> {
    const { data: result, error } = await db
      .getClient()
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(`Failed to get messages: ${error.message}`);
    }

    return result as MessageDto[];
  }

  /**
   * 根据 conversation_id 分页获取最近的消息
   */
  async getMessageChunk(
    conversationId: string,
    page: number = 1,
    limit: number = 20,
    beforeMessageId?: string
  ): Promise<{ messages: MessageDto[]; hasMore: boolean; total: number }> {
    // 先获取总数
    const { count: total, error: countError } = await db
      .getClient()
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("conversation_id", conversationId);

    if (countError) {
      throw new Error(`Failed to get message count: ${countError.message}`);
    }

    let query = db
      .getClient()
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true }); // 直接按时间正序排列

    // 如果指定了 beforeMessageId，则获取该消息之前的消息
    if (beforeMessageId) {
      // 先获取该消息的创建时间
      const { data: beforeMessage, error: beforeError } = await db
        .getClient()
        .from("messages")
        .select("created_at")
        .eq("id", beforeMessageId)
        .single();

      if (beforeError) {
        throw new Error(`Failed to get before message: ${beforeError.message}`);
      }

      query = query.lt("created_at", beforeMessage.created_at);
    }

    // 分页 - 如果我们要获取"最近的"消息，需要从后往前计算offset
    const totalMessages = total || 0;
    const offset = Math.max(0, totalMessages - page * limit);
    query = query.range(offset, offset + limit - 1);

    const { data: result, error } = await query;

    if (error) {
      throw new Error(`Failed to get message chunk: ${error.message}`);
    }

    const messages = (result as MessageDto[]) || [];
    const hasMore = offset > 0; // 如果offset > 0，说明还有更早的消息

    return {
      messages,
      hasMore,
      total: totalMessages,
    };
  }

  /**
   * 根据 ID 获取单个消息
   */
  async getMessageById(id: string): Promise<MessageDto | null> {
    const { data: result, error } = await db
      .getClient()
      .from("messages")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // No rows returned
      }
      throw new Error(`Failed to get message: ${error.message}`);
    }

    return result as MessageDto;
  }
}

export const messageService = MessageService.getInstance();
export default messageService;
