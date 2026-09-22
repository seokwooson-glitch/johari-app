import crypto from "crypto";

// 로그인 없이 특정 구성원 전용 링크(자기평가/결과 열람)를 만들 때 쓰는 서명 토큰.
// 세션 쿠키(session.ts)와 시크릿은 같지만 용도 구분자(self:/result:)를 값에 넣어
// 자기평가 링크가 결과 링크로, 혹은 그 반대로 오용되지 않게 한다.
const purposes = ["self", "result"] as const;
export type LinkPurpose = (typeof purposes)[number];

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

export function createMemberLinkToken(purpose: LinkPurpose, memberId: string): string {
  return sign(`${purpose}:${memberId}`);
}

export function verifyMemberLinkToken(purpose: LinkPurpose, token: string): string | null {
  const value = verify(token);
  if (!value) return null;
  const prefix = `${purpose}:`;
  if (!value.startsWith(prefix)) return null;
  return value.slice(prefix.length);
}
