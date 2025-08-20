import type { NextApiResponse } from "next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import {
  chain,
  withMethods,
  withAuth,
  ExtendedNextApiRequest,
} from "@/utils/api/handler";
import MemoryClient from "mem0ai";
import { env } from "@/utils/env";

const handler = async function handler(
  req: ExtendedNextApiRequest,
  res: NextApiResponse
) {
  try {
    const userId = req.session.user.id;
    const memoryClient = new MemoryClient({ apiKey: env.MEM0_API_KEY });
    await memoryClient.deleteAll({ user_id: userId });
    return res.status(200).json({
      message: `Memory deleted successfully, userId: ${userId}`,
      code: 0,
    });
  } catch (error) {
    console.error("Memory deletion error:", error);
    return res.status(500).json({
      message: "Failed to delete memory",
      code: 1,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export default chain(withMethods(["DELETE"]), withAuth(authOptions))(handler);
