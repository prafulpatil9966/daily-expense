import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

const COOKIE_NAME = "pocket-access";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

function sign(value: string): string {
  const password = process.env.POCKET_ACCESS_PASSWORD;
  if (!password) throw new Error("POCKET_ACCESS_PASSWORD is not configured.");
  return createHmac("sha256", password).update(value).digest("base64url");
}

function isValidCookie(cookie: string | undefined): boolean {
  if (!cookie) return false;
  const [value, signature] = cookie.split(".");
  if (!value || !signature) return false;

  const expected = sign(value);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  return signatureBuffer.length === expectedBuffer.length
    && timingSafeEqual(signatureBuffer, expectedBuffer);
}

export async function GET(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.split(";").map((item) => item.trim()).find((item) => item.startsWith(`${COOKIE_NAME}=`));
  const value = match ? decodeURIComponent(match.slice(COOKIE_NAME.length + 1)) : undefined;
  return NextResponse.json({ unlocked: isValidCookie(value) });
}

export async function POST(request: Request) {
  const password = process.env.POCKET_ACCESS_PASSWORD;
  if (!password) {
    return NextResponse.json({ error: "Personal access password is not configured." }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const supplied = typeof body?.password === "string" ? body.password : "";
  const suppliedBuffer = Buffer.from(supplied);
  const passwordBuffer = Buffer.from(password);

  if (suppliedBuffer.length !== passwordBuffer.length || !timingSafeEqual(suppliedBuffer, passwordBuffer)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const value = "owner";
  const response = NextResponse.json({ unlocked: true });
  response.cookies.set(COOKIE_NAME, `${value}.${sign(value)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ unlocked: false });
  response.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
  return response;
}
