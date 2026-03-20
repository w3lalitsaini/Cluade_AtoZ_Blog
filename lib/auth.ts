import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import User from "@/models/User";
import connectDB from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          await connectDB();
          const user = await User.findOne({
            email: credentials.email,
          }).select("+password");

          if (!user || !user.password) return null;

          const { comparePassword } = require("@/lib/bcrypt");
          const isValid = await comparePassword(
            credentials.password as string,
            user.password,
          );
          if (!isValid) return null;

          // Block unverified users from logging in
          if (!user.isVerified) {
            throw new Error("email-not-verified");
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          };
        } catch (e: unknown) {
          // Re-throw our custom error so NextAuth surfaces it
          if (e instanceof Error && e.message === "email-not-verified") {
            throw e;
          }
          console.error("Credentials authorize error:", e);
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role || "user";
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string; id?: string }).role =
          token.role as string;
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  trustHost: true,
  debug: true,
});
