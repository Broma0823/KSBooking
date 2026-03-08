import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://localhost:5432/ks_booking?schema=public";

// Supabase (and most cloud Postgres) require SSL. Enable it when using Supabase pooler.
const isSupabase =
  connectionString.includes("supabase.com") ||
  connectionString.includes("pooler.supabase.com");
const useSsl =
  process.env.DATABASE_SSL === "true" || isSupabase;

const adapter = new PrismaPg({
  connectionString,
  connectionTimeoutMillis: 10_000,
  ...(useSsl && {
    ssl: { rejectUnauthorized: false },
  }),
});

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
