import { z } from "zod";
import { config } from "@dotenvx/dotenvx";

config();

const envSchema = z.object({
  OPENAI_API_KEY: z.string(),
  NEXTAUTH_URL: z.string(),
  NEXTAUTH_SECRET: z.string(),
  SUPABASE_URL: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  NODE_ENV: z.enum(["development", "production"]),
});

let env = {} as z.infer<typeof envSchema>;

env = envSchema.parse(process.env);

export { env };
