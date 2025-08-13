import type { NextApiResponse } from "next";
import { ModelDto, CreateModelDtoSchema } from "@/pages/dto/model.dto";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import {
  chain,
  withMethods,
  withAuth,
  withZod,
  ExtendedNextApiRequest,
} from "@/utils/api/handler";
import { modelService } from "@/pages/service/model.service";

const handler = async function handler(
  req: ExtendedNextApiRequest,
  res: NextApiResponse
) {
  const { provider, model_name } = req.validated as ModelDto;

  try {
    const model = await modelService.createModel({
      provider,
      model_name,
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
