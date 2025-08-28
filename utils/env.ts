import { z } from "zod";

const envSchema = z.object({
  OPENAI_API_KEY: z.string(),
  NEXTAUTH_URL: z.string(),
  NEXTAUTH_SECRET: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  NODE_ENV: z.enum(["development", "production"]),
  MEM0_API_KEY: z.string(),
  DATABASE_URL: z.string(),
  LANGFUSE_SECRET_KEY: z.string(),
  LANGFUSE_PUBLIC_KEY: z.string(),
  LANGFUSE_BASEURL: z.string(),
});

let env = {} as z.infer<typeof envSchema>;

env = envSchema.parse(process.env);

export { env };
