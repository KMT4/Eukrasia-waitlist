import { createNeonAuth } from "@neondatabase/auth/next/server";

function configuredAdminEmail() {
  return process.env.ADMIN_EMAIL?.trim().toLowerCase() ?? "";
}

export function authBaseUrl() {
  return (
    process.env.DATABASE_NEON_AUTH_BASE_URL?.trim() ||
    process.env.NEON_AUTH_BASE_URL?.trim() ||
    ""
  );
}

export function adminAuth() {
  const baseUrl = authBaseUrl();
  const secret = process.env.NEON_AUTH_COOKIE_SECRET?.trim() ?? "";

  if (!baseUrl || secret.length < 32) {
    throw new Error("Administrator authentication is not configured.");
  }

  return createNeonAuth({
    baseUrl,
    cookies: {
      secret,
      sessionDataTtl: 300,
    },
    logLevel: "warn",
  });
}

export function isApprovedAdminEmail(email?: string | null) {
  const approved = configuredAdminEmail();
  return Boolean(approved && email?.trim().toLowerCase() === approved);
}

export async function getApprovedAdmin() {
  try {
    const { data } = await adminAuth().getSession();
    if (!data?.user || !isApprovedAdminEmail(data.user.email)) return null;
    return { email: data.user.email.trim().toLowerCase(), userId: data.user.id };
  } catch {
    return null;
  }
}
