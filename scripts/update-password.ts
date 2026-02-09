/**
 * Update password for an existing user (bcryptjs hash so login works).
 * Usage: npx tsx scripts/update-password.ts
 * Set in .env.local: ADMIN_EMAIL=your@email.com ADMIN_PASSWORD=your-secure-password
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
        const value = match[2].trim().replace(/^["']|["']$/g, "").replace(/\r$/, "");
        if (!process.env[key]) process.env[key] = value;
      }
    }
  }
}

loadEnvLocal();

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();
const email = process.env.ADMIN_EMAIL?.trim();
const password = process.env.ADMIN_PASSWORD?.trim();
if (!email || !password) {
  console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local (no defaults for security).");
  process.exit(1);
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

async function main(adminEmail: string, adminPassword: string) {
  const supabase = createClient(supabaseUrl as string, supabaseServiceKey as string);
  const password_hash = await bcrypt.hash(adminPassword, 10);
  const { data, error } = await supabase
    .from("users")
    .update({ password_hash, updated_at: new Date().toISOString() })
    .eq("email", adminEmail)
    .select("id, email")
    .single();

  if (error) {
    console.error("Update failed:", error.message);
    if (error.message === "Invalid API key")
      console.error("Check that SUPABASE_SERVICE_ROLE_KEY in .env.local is the service_role secret from Supabase Dashboard → Project Settings → API (not the anon key).");
    process.exit(1);
  }
  if (!data) {
    console.error("No user found with email:", email);
    process.exit(1);
  }
  console.log("Password updated for:", data.email);
}

main(email, password);
