import type { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { chain, withMethods, withAuth } from "@/utils/api/handler";
import { modelService } from "@/pages/service/model.service";

const handler = async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({
      message: "Model ID is required",
      code: 1,
      error: "Missing or invalid model ID in query parameters",
    });
  }

  try {
    await modelService.deleteModel(id);

    return res.status(200).json({
      message: "Model deleted successfully",
      code: 0,
    });
  } catch (error) {
    console.error("Model deletion error:", error);
    return res.status(500).json({
      message: "Failed to delete model",
      code: 1,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export default chain(withMethods(["DELETE"]), withAuth(authOptions))(handler);
