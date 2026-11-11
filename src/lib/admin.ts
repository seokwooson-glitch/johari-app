import { getSessionMemberId } from "@/lib/session";

export async function requireAdmin() {
  const memberId = await getSessionMemberId();
  const adminId = process.env.ADMIN_MEMBER_ID;
  if (!memberId || !adminId || memberId !== adminId) return null;
  return memberId;
}
