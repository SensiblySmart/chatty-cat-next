import { ModelDto } from "@/pages/dto/model.dto";
import db from "./db";

interface ModelRecord extends ModelDto {
  created_at: string;
  updated_at: string;
  id: string;
}

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
  async createModel(data: ModelDto): Promise<ModelRecord> {
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

    return result as ModelRecord;
  }

  /**
   * 获取所有 model 记录
   */
  async listAllModels(): Promise<ModelRecord[]> {
    const { data: result, error } = await db
      .getClient()
      .from("models")
      .select("*")
      .limit(100);

    if (error) {
      throw new Error(`Failed to list models: ${error.message}`);
    }

    return result as ModelRecord[];
  }
}

export const modelService = ModelService.getInstance();
export default modelService;
