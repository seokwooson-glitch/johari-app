import { cookies } from "next/headers";
import crypto from "crypto";

// 범용(개인용) 조하리의 창 전용 세션 — 인사실 앱의 세션(johari_session)과는
// 별도 쿠키를 써서 두 앱을 같은 브라우저에서 동시에 써도 서로 안 섞이게 한다.
const COOKIE_NAME = "personal_session";
const MAX_AGE = 60 * 60 * 24 * 180; // 180일

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET 환경변수가 설정되어 있지 않습니다.");
  return secret;
}

function sign(value: string): string {
  const sig = crypto.createHmac("sha256", getSecret()).update(value).digest("base64url");
  return `${value}.${sig}`;
}

function verify(signed: string): string | null {
  const idx = signed.lastIndexOf(".");
  if (idx < 0) return null;
  const value = signed.slice(0, idx);
  const sig = signed.slice(idx + 1);
  const expected = crypto.createHmac("sha256", getSecret()).update(value).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return value;
}

export async function createPersonalSession(accountId: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, sign(accountId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function getPersonalSessionId(): Promise<string | null> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  return verify(raw);
}

export async function destroyPersonalSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
