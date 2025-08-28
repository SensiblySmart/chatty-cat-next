import {
  ConversationDto,
  CreateConversationDto,
} from "@/src/dto/conversation.dto";
import { prisma } from '@/prisma'

class ConversationService {
  private static instance: ConversationService;

  private constructor() {}

  public static getInstance(): ConversationService {
    if (!ConversationService.instance) {
      ConversationService.instance = new ConversationService();
    }
    return ConversationService.instance;
  }

  async createConversation(
    data: CreateConversationDto
  ): Promise<ConversationDto> {
    const conversation = await prisma.conversation.create({
      data: {
        ...data,
      },
    });

    return conversation;
  }

  async listAllConversations(userId: string): Promise<ConversationDto[]> {
    const conversations = await prisma.conversation.findMany({
      where: {
        userId,
        isDeleted: false,
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
    });
    return conversations;
  }

  async getConversation(
    id: string,
    userId: string
  ): Promise<ConversationDto | null> {
    const conversation = await prisma.conversation.findUnique({
      where: {
        id,
        userId,
      },
    });

    return conversation;
  }

  /**
   * 更新 conversation 的最后消息时间
   */
  async updateLastMessageTime(
    id: string,
    userId: string
  ): Promise<ConversationDto> {
    const conversation = await prisma.conversation.update({
      where: {
        id,
        userId,
      },
      data: {
        lastMessageAt: new Date().toISOString(),
      },
    });
    return conversation;
  }

  async updateConversationTitle(
    id: string,
    title: string,
    userId: string
  ): Promise<ConversationDto> {
    const conversation = await prisma.conversation.update({
      where: {
        id,
        userId,
      },
      data: {
        title,
      },
    });
    return conversation;
  }

  async deleteConversation(
    id: string,
    userId: string
  ): Promise<ConversationDto> {
    const conversation = await prisma.conversation.update({
      where: {
        id,
        userId,
      },
      data: {
        isDeleted: true,
      },
    });
    return conversation;
  }
}

export const conversationService = ConversationService.getInstance();
export default conversationService;
