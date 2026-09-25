import { NextResponse } from "next/server";
import { authBaseUrl, isApprovedAdminEmail } from "@/lib/admin-auth";

type AuthContext = { params: Promise<{ path: string[] }> };
const PRODUCTION_ORIGIN = "https://eukrasia-waitlist-preview.vercel.app";

function neonTrustedOrigin() {
  return PRODUCTION_ORIGIN;
}

async function approvedEmailRequest(request: Request, context: AuthContext) {
  const path = (await context.params).path.join("/");
  if (path !== "sign-up/email" && path !== "sign-in/email") return true;

  try {
    const body = (await request.clone().json()) as { email?: string };
    return isApprovedAdminEmail(body.email);
  } catch {
    return false;
  }
}

export async function GET(request: Request, context: AuthContext) {
  return proxyToNeon(request, context);
}

export async function POST(request: Request, context: AuthContext) {
  if (!(await approvedEmailRequest(request, context))) {
    return NextResponse.json({ message: "This email is not authorised for the admin portal." }, { status: 403 });
  }
  return proxyToNeon(request, context);
}

export async function PUT(request: Request, context: AuthContext) {
  return proxyToNeon(request, context);
}

export async function PATCH(request: Request, context: AuthContext) {
  return proxyToNeon(request, context);
}

export async function DELETE(request: Request, context: AuthContext) {
  return proxyToNeon(request, context);
}

async function proxyToNeon(request: Request, context: AuthContext) {
  const path = (await context.params).path.map(encodeURIComponent).join("/");
  const incomingUrl = new URL(request.url);
  const upstreamUrl = `${authBaseUrl()}/${path}${incomingUrl.search}`;
  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  const cookie = request.headers.get("cookie");
  if (contentType) headers.set("content-type", contentType);
  if (cookie) headers.set("cookie", cookie);
  headers.set("origin", neonTrustedOrigin());
  headers.set("accept", "application/json");

  const upstream = await fetch(upstreamUrl, {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.text(),
    redirect: "manual",
    cache: "no-store",
  });

  const responseHeaders = new Headers();
  const upstreamContentType = upstream.headers.get("content-type");
  const location = upstream.headers.get("location");
  if (upstreamContentType) responseHeaders.set("content-type", upstreamContentType);
  if (location) responseHeaders.set("location", location);
  for (const setCookie of upstream.headers.getSetCookie()) {
    responseHeaders.append("set-cookie", setCookie);
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}
