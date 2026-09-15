import { cookies } from "next/headers";
import crypto from "crypto";

// 가벼운 자체 서명 쿠키 세션. 회사 SSO 연동이 아니라 "이름+본인 설정 비밀번호"만으로
// 신원을 확인하는 프로토타입/소규모 내부용 인증이라는 점을 감안한 최소 구현.
const COOKIE_NAME = "johari_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30일

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

export async function createSession(memberId: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, sign(memberId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function getSessionMemberId(): Promise<string | null> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  return verify(raw);
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
