import type { NextApiResponse } from "next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import {
  chain,
  withMethods,
  withAuth,
  ExtendedNextApiRequest,
  withZod,
} from "@/utils/api/handler";
import { z } from "zod";
import agentService from "@/src/service/agent.service";

const GetAgentSchema = z.object({
  id: z.string(),
});

const handler = async function handler(
  req: ExtendedNextApiRequest,
  res: NextApiResponse
) {
  try {
    const { id } = req.validated as z.infer<typeof GetAgentSchema>;

    const agent = await agentService.getAgentById(id);

    return res.status(200).json({
      message: "Agent retrieved successfully",
      code: 0,
      data: agent,
    });
  } catch (error) {
    console.error("Agent get error:", error);
    return res.status(500).json({
      message: "Failed to retrieve agent",
      code: 1,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export default chain(
  withMethods(["GET"]),
  withAuth(authOptions),
  withZod(GetAgentSchema, "query")
)(handler);
