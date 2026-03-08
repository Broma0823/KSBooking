import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@example.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "change-me";

export async function ensureDefaultAdmin() {
  const existing = await prisma.adminUser.findFirst();
  if (existing) {
    return existing;
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  return prisma.adminUser.create({
    data: {
      email: ADMIN_EMAIL,
      passwordHash,
    },
  });
}

export async function authenticateAdmin(email: string, password: string) {
  await ensureDefaultAdmin();

  const admin = await prisma.adminUser.findUnique({
    where: { email },
  });

  if (!admin) {
    return null;
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    return null;
  }

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.adminSession.create({
    data: {
      token,
      adminId: admin.id,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set("admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return admin;
}

export async function getCurrentAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token) {
    return null;
  }

  const session = await prisma.adminSession.findFirst({
    where: {
      token,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      admin: true,
    },
  });

  return session?.admin ?? null;
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;

  if (token) {
    await prisma.adminSession.deleteMany({
      where: { token },
    });
  }

  cookieStore.set("admin_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

