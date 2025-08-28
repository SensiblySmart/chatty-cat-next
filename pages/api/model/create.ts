import type { NextApiResponse } from "next";
import { CreateModelDto, CreateModelDtoSchema } from "@/src/dto/model.dto";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import {
  chain,
  withMethods,
  withAuth,
  withZod,
  ExtendedNextApiRequest,
} from "@/utils/api/handler";
import { modelService } from "@/src/service/model.service";

const handler = async function handler(
  req: ExtendedNextApiRequest,
  res: NextApiResponse
) {
  const { provider, modelName } = req.validated as CreateModelDto;

  try {
    const model = await modelService.createModel({
      provider,
      modelName,
    });

    return res.status(201).json({
      message: "Model created successfully",
      code: 0,
      data: model,
    });
  } catch (error) {
    console.error("Model creation error:", error);
    return res.status(500).json({
      message: "Failed to create model",
      code: 1,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export default chain(
  withMethods(["POST"]),
  withAuth(authOptions),
  withZod(CreateModelDtoSchema, "body")
)(handler);
