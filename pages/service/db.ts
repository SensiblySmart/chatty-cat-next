import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/utils/env";

class DatabaseService {
  private static instance: DatabaseService;
  private supabase: SupabaseClient;

  private constructor() {
    this.supabase = createClient(
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY
    );
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public getClient(): SupabaseClient {
    return this.supabase;
  }
}

export const db = DatabaseService.getInstance();
export default db;
