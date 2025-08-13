// src/utils/api/handlers.ts
import type { NextApiRequest, NextApiResponse } from "next";
import type { NextAuthOptions, Session } from "next-auth";
import { getServerSession } from "next-auth/next";
import type { ZodSchema } from "zod";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ExtendedNextApiRequest extends NextApiRequest {
  validated?: unknown;
  session?: Session;
}

type Handler = (
  req: NextApiRequest,
  res: NextApiResponse
) => unknown | Promise<unknown>;
type Middleware = (handler: Handler) => Handler;

// 组合器：从右到左包裹
export const chain =
  (...middlewares: Middleware[]) =>
  (handler: Handler) =>
    middlewares.reduceRight((h, m) => m(h), handler);

// 仅允许指定方法
export const withMethods =
  (allowed: HttpMethod[]): Middleware =>
  (handler) =>
  async (req, res) => {
    if (!allowed.includes(req.method as HttpMethod)) {
      res.setHeader("Allow", allowed);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
    return handler(req, res);
  };

// 登录态校验（通过后把 session 挂到 req 上）
export const withAuth =
  (authOptions: NextAuthOptions): Middleware =>
  (handler) =>
  async (req: NextApiRequest & { session?: Session }, res: NextApiResponse) => {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    req.session = session;
    return handler(req, res);
  };

// 可选：zod 校验（body 或 query）
export const withZod =
  <T extends ZodSchema<unknown>>(
    schema: T,
    source: "body" | "query" = "body"
  ): Middleware =>
  (handler) =>
  async (
    req: NextApiRequest & { validated?: unknown },
    res: NextApiResponse
  ) => {
    const input = source === "body" ? req.body : req.query;
    const parsed = schema.safeParse(input);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.format() });
    }
    // 通过后把解析结果挂到 req.validated 上
    (req as { validated?: unknown }).validated = parsed.data;
    return handler(req, res);
  };
