import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { redirect } from "next/navigation";

import { UserRole, UserStatus } from "@/app/generated/prisma/enums";
import { getDashboardHome, getOrganizerStatusRedirect } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          select: {
            id: true,
            name: true,
            email: true,
            password: true,
            role: true,
            status: true,
          },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await compare(parsed.data.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id && token.role && token.status) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.status = token.status;
      }

      return session;
    },
  },
};

export async function getSession() {
  return getServerSession(authOptions);
}

export async function getSessionUser() {
  const session = await getSession();
  return session?.user ?? null;
}

export async function requireSessionUser() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function redirectAuthenticatedUser() {
  const user = await getSessionUser();

  if (user) {
    redirect("/dashboard");
  }
}

export async function requireDashboardAccess() {
  const user = await requireSessionUser();

  if (user.role === UserRole.ORGANIZER) {
    const redirectPath = getOrganizerStatusRedirect(user.status);

    if (redirectPath) {
      redirect(redirectPath);
    }
  }

  return user;
}

export async function requireRole(role: keyof typeof UserRole) {
  const user = await requireDashboardAccess();

  if (user.role !== role) {
    redirect("/unauthorized");
  }

  return user;
}

export async function redirectDashboardIndex() {
  const user = await requireDashboardAccess();

  if (user.role === UserRole.ORGANIZER) {
    const organizerRedirect = getOrganizerStatusRedirect(user.status);

    if (organizerRedirect) {
      redirect(organizerRedirect);
    }
  }

  redirect(getDashboardHome(user.role));
}

export function isApprovedOrganizerStatus(status: keyof typeof UserStatus) {
  return status === UserStatus.ACTIVE;
}
