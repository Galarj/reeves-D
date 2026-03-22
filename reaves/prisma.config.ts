import path from "node:path";
import { defineConfig } from "@prisma/config";

// On Vercel, env vars are injected automatically.
// Locally, dotenv loads .env.local for the DIRECT_URL used by Prisma Migrate.
try {
  const { config } = await import("dotenv");
  config({ path: path.resolve(process.cwd(), ".env.local") });
} catch {
  // dotenv is optional — Vercel injects env vars natively
}

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: process.env.DIRECT_URL!,
  },
});
