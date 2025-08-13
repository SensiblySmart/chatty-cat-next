import { ModelDto, CreateModelDto } from "@/pages/dto/model.dto";
import db from "./db";

class ModelService {
  private static instance: ModelService;

  private constructor() {}

  public static getInstance(): ModelService {
    if (!ModelService.instance) {
      ModelService.instance = new ModelService();
    }
    return ModelService.instance;
  }

  /**
   * 创建新的 model 记录
   */
  async createModel(data: CreateModelDto): Promise<ModelDto> {
    const { data: result, error } = await db
      .getClient()
      .from("models")
      .insert({
        ...data,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create model: ${error.message}`);
    }

    return result as ModelDto;
  }

  /**
   * 获取所有 model 记录
   */
  async listAllModels(): Promise<ModelDto[]> {
    const { data: result, error } = await db
      .getClient()
      .from("models")
      .select("*")
      .limit(100);

    if (error) {
      throw new Error(`Failed to list models: ${error.message}`);
    }

    return result as ModelDto[];
  }
}

export const modelService = ModelService.getInstance();
export default modelService;
