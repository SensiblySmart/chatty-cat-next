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
