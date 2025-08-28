import { ModelDto, CreateModelDto } from "@/src/dto/model.dto";
import db from "./db";
import { prisma } from '@/prisma'

class ModelService {
  private static instance: ModelService;

  private constructor() {}

  public static getInstance(): ModelService {
    if (!ModelService.instance) {
      ModelService.instance = new ModelService();
    }
    return ModelService.instance;
  }

  async createModel(data: CreateModelDto): Promise<ModelDto> {
    const model = await prisma.model.create({
      data,
    });

    return model;
  }

  async listAllModels(): Promise<ModelDto[]> {
    const models = await prisma.model.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return models;
  }

  /**
   * 根据 ID 删除 model 记录
   */
  async deleteModel(id: string): Promise<ModelDto> {
    const model = await prisma.model.delete({
      where: {
        id,
      },
    });
    return model;
  }

  async getModelById(id: string): Promise<ModelDto | null> {
    const model = await prisma.model.findUnique({
      where: {
        id,
      },
    });
    return model;
  }
}

export const modelService = ModelService.getInstance();
export default modelService;
