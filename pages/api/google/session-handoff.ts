import type { NextApiResponse } from "next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import {
  chain,
  withMethods,
  withAuth,
  ExtendedNextApiRequest,
} from "@/utils/api/handler";

const handler = async function handler(
  req: ExtendedNextApiRequest,
  res: NextApiResponse
) {
  const cookie = req.cookies;

  console.log("cookie", cookie);
  const token = cookie["chatty-kitty-session-token"];

  return res.status(200).json({
    message: "success",
    token,
    code: 0,
  });
};

export default chain(withMethods(["POST"]), withAuth(authOptions))(handler);
