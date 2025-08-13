import type { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { chain, withMethods, withAuth } from "@/utils/api/handler";
import { agentService } from "@/pages/service/agent.service";

const handler = async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const agents = await agentService.listAllAgents();

    return res.status(200).json({
      message: "Agents retrieved successfully",
      code: 0,
      data: agents,
    });
  } catch (error) {
    console.error("Agent list error:", error);
    return res.status(500).json({
      message: "Failed to retrieve agents",
      code: 1,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export default chain(withMethods(["GET"]), withAuth(authOptions))(handler);
