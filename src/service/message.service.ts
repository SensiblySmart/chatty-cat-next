import { MessageDto, CreateMessageDto } from "@/src/dto/message.dto";
import { prisma } from '@/prisma'

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
    const result = await prisma.message.create({
      data: {
        ...data,
        createdAt: new Date(), // createdAt 不知道为什么设置了 @default(now()) 仍然会报错 required, 暂时手动传
      }
    });

    return result;
  }

  /**
   * 根据 conversation_id 获取所有消息
   */
  async getMessagesByConversationId(
    conversationId: string
  ): Promise<MessageDto[]> {
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
      },
    });

    return messages;
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

    const take = limit + 1; // fetch one extra to determine hasMore

    const [totalCount, fetched] = await Promise.all([
      prisma.message.count({ where: { conversationId } }),
      beforeMessageId
        ? prisma.message.findMany({
            where: { conversationId },
            orderBy: [
              { createdAt: 'desc' },
              { id: 'desc' },
            ],
            cursor: { id: beforeMessageId },
            skip: 1, // exclude the cursor item
            take,
          })
        : prisma.message.findMany({
            where: { conversationId },
            orderBy: [
              { createdAt: 'desc' },
              { id: 'desc' },
            ],
            skip: Math.max(0, (page - 1) * limit),
            take,
          }),
    ]);

    const hasMore = fetched.length > limit;
    const sliced = hasMore ? fetched.slice(0, limit) : fetched;

    // Return messages sorted ascending for UI consistency
    const messages = [...sliced].sort((a, b) => {
      if (a.createdAt < b.createdAt) return -1;
      if (a.createdAt > b.createdAt) return 1;
      return a.id.localeCompare(b.id);
    });

    return { messages, hasMore, total: totalCount };
  }

  /**
   * 根据 ID 获取单个消息
   */
  async getMessageById(id: string): Promise<MessageDto | null> {
    return await prisma.message.findUnique({ where: { id } });
  }
}

export const messageService = MessageService.getInstance();
export default messageService;
