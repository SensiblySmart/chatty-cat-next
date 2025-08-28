import type { NextApiResponse } from "next";
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
  try {
    const model = await modelService.listAllModels();

    return res.status(201).json({
      message: "Model list successfully",
      code: 0,
      data: model,
    });
  } catch (error) {
    console.error("Model list error:", error);
    return res.status(500).json({
      message: "Failed to list model",
      code: 1,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export default chain(withMethods(["GET"]), withAuth(authOptions))(handler);
