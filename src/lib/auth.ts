import { NextAuthOptions, getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        login: { label: "Username atau Email", type: "text" },
        password: { label: "Password", type: "password" },
        idToken: { label: "ID Token", type: "text" },
      },
      async authorize(credentials) {
        if (credentials?.idToken) {
          try {
            const { adminAuth } = await import("@/lib/firebase-admin");

            if (!adminAuth) {
              console.error("[auth] Firebase Admin not initialized — check FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY env vars");
              return null;
            }

            const decodedToken = await adminAuth.verifyIdToken(credentials.idToken);
            const uid = decodedToken.uid;

            console.log("[auth] Firebase token verified, UID exists:", !!uid, "Email:", !!decodedToken.email);

            // Find linked account
            const linkedAccount = await prisma.linkedAccount.findUnique({
              where: {
                provider_providerAccountId: {
                  provider: "google",
                  providerAccountId: uid,
                },
              },
              include: { user: true },
            });

            if (!linkedAccount || !linkedAccount.user) {
              if (decodedToken.email) {
                const existingUser = await prisma.user.findUnique({
                  where: { email: decodedToken.email },
                });
                if (existingUser) {
                  console.log("[auth] Google email exists but not linked to Google.");
                  throw new Error("EXISTING_EMAIL_NOT_LINKED");
                }
              }
              console.log("[auth] No LinkedAccount found for Google UID — user needs to register");
              return null;
            }

            console.log("[auth] LinkedAccount found, User ID:", linkedAccount.user.id);

            return {
              id: linkedAccount.user.id,
              name: linkedAccount.user.fullName,
              email: linkedAccount.user.email,
              role: linkedAccount.user.role,
              setupComplete: !!linkedAccount.user.institution,
            };
          } catch (error) {
            console.error("Firebase token verification error:", error);
            return null;
          }
        }

        if (!credentials?.login || !credentials?.password) {
          return null;
        }

        const loginInput = credentials.login.trim().toLowerCase();
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: loginInput },
              { username: loginInput },
            ],
          },
        });

        if (!user || !user.password) {
          return null;
        }

        let isPasswordValid = false;
        if (user.password.startsWith("$2a$") || user.password.startsWith("$2b$")) {
          isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        } else {
          // Automatic migration of legacy plaintext password to secure bcrypt hash
          if (user.password === credentials.password) {
            isPasswordValid = true;
            const hashedPassword = await bcrypt.hash(credentials.password, 10);
            await prisma.user.update({
              where: { id: user.id },
              data: { password: hashedPassword },
            });
          }
        }

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.fullName,
          email: user.email,
          role: user.role,
          setupComplete: !!user.institution,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      if (trigger === "update" && session?.setupComplete !== undefined) {
        token.setupComplete = session.setupComplete;
      }
      if (account) {
        token.provider = account.provider;
        token.providerAccountId = account.providerAccountId;
      }
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "Siswa";
        token.setupComplete = (user as any).setupComplete;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id || token.sub;
        (session.user as any).role = token.role || "Siswa";
        (session.user as any).setupComplete = token.setupComplete;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "interntrack-secret-key-2026",
};

export async function getServerAuthSession() {
  return await getServerSession(authOptions);
}
