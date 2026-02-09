/**
 * Seed the first admin user. Run after applying DB migrations.
 * Usage: npx tsx scripts/seed-admin.ts
 * Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local (or pass via env).
 */
import { createClient } from "@supabase/supabase-js";
import * as bcrypt from "bcryptjs";
import * as fs from "fs";
import * as path from "path";

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) process.env[key] = value;
      }
    }
  }
}

loadEnvLocal();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.ADMIN_EMAIL ?? "admin@example.com";
const password = process.env.ADMIN_PASSWORD ?? "ChangeMeInProduction!";

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

async function main() {
  const supabase = createClient(supabaseUrl as string, supabaseServiceKey as string);
  const password_hash = await bcrypt.hash(password, 10);
  const { data, error } = await supabase.from("users").insert({
    email,
    password_hash,
    full_name: "Admin",
    role: "admin",
  }).select("id, email").single();

  if (error) {
    if (error.code === "23505") {
      console.log("Admin user already exists for", email);
      return;
    }
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
  console.log("Admin user created:", data?.email);
}

main();
