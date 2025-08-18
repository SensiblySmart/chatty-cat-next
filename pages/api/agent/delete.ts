import type { NextApiResponse } from "next";
import { DeleteAgentDtoSchema } from "@/src/dto/agent.dto";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import {
  chain,
  withMethods,
  withAuth,
  withZod,
  ExtendedNextApiRequest,
} from "@/utils/api/handler";
import { agentService } from "@/src/service/agent.service";

const handler = async function handler(
  req: ExtendedNextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.validated as { id: string };

  try {
    await agentService.deleteAgent(id);

    return res.status(200).json({
      message: "Agent deleted successfully",
      code: 0,
    });
  } catch (error) {
    console.error("Agent delete error:", error);
    return res.status(500).json({
      message: "Failed to delete agent",
      code: 1,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export default chain(
  withMethods(["DELETE"]),
  withAuth(authOptions),
  withZod(DeleteAgentDtoSchema, "body")
)(handler);
