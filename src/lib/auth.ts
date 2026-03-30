import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = () => new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret");

export async function createSession(name: string) {
  const token = await new SignJWT({ name })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(secret());

  (await cookies()).set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export async function getUser(): Promise<{ name: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return { name: payload.name as string };
  } catch {
    return null;
  }
}

export async function logout() {
  (await cookies()).delete("session");
}