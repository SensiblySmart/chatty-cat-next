-- AlterTable
ALTER TABLE "public"."conversations" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "last_message_at" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "is_deleted" SET DEFAULT false;
