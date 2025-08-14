import type { NextApiResponse } from "next";
import {
  chain,
  withMethods,
  ExtendedNextApiRequest,
  withZod,
} from "@/utils/api/handler";
import { z } from "zod";
import { env } from "@/utils/env";

const SessionConsumeSchema = z.object({
  token: z.string(),
});

const handler = async function handler(
  req: ExtendedNextApiRequest,
  res: NextApiResponse
) {
  const { token } = req.validated as z.infer<typeof SessionConsumeSchema>;

  let domain = "";
  const url = new URL(env.NEXTAUTH_URL);
  domain = url.hostname;

  // 设置过期时间（30天）
  const maxAge = 30 * 24 * 60 * 60; // 30 days in seconds
  const expires = new Date(Date.now() + maxAge * 1000);

  // 构建 cookie 字符串
  let cookieString = `next-auth.session-token=${token}; Path=/; HttpOnly; Max-Age=${maxAge}; Expires=${expires.toUTCString()}`;

  // 在生产环境中添加 Secure 和 SameSite
  if (env.NEXTAUTH_URL.startsWith("https://")) {
    cookieString += "; Secure; SameSite=None";
  } else {
    // 本地开发环境
    cookieString += "; SameSite=Lax";
  }

  // 只有在有有效域名时才添加 Domain
  if (domain && domain !== "localhost") {
    cookieString += `; Domain=${domain}`;
  }

  res.setHeader("Set-Cookie", cookieString);

  const response = {
    message: "success",
    code: 0,
  };

  return res.status(200).json(response);
};

export default chain(
  withMethods(["POST"]),
  withZod(SessionConsumeSchema, "body")
)(handler);
