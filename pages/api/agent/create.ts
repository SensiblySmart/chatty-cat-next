import type { NextApiResponse } from "next";
import { CreateAgentDto, CreateAgentDtoSchema } from "@/src/dto/agent.dto";
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
  const agentData = req.validated as CreateAgentDto;

  try {
    const agent = await agentService.createAgent(agentData);

    return res.status(201).json({
      message: "Agent created successfully",
      code: 0,
      data: agent,
    });
  } catch (error) {
    console.error("Agent creation error:", error);
    return res.status(500).json({
      message: "Failed to create agent",
      code: 1,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export default chain(
  withMethods(["POST"]),
  withAuth(authOptions),
  withZod(CreateAgentDtoSchema, "body")
)(handler);
