import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getSupabaseServer } from "./supabase";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const supabase = getSupabaseServer();
        const { data: user, error } = await supabase
          .from("users")
          .select("id, email, full_name, role, password_hash")
          .eq("email", credentials.email)
          .single();
        if (error || !user) return null;
        const valid = await bcrypt.compare(
          credentials.password,
          user.password_hash
        );
        if (!valid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.full_name ?? undefined,
          role: user.role,
        };
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
};
