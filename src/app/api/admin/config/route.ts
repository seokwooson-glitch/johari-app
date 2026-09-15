import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionMemberId } from "@/lib/session";

async function requireAdmin() {
  const memberId = await getSessionMemberId();
  const adminId = process.env.ADMIN_MEMBER_ID;
  if (!memberId || !adminId || memberId !== adminId) return null;
  return memberId;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "권한이 없어요." }, { status: 403 });

  const config = await prisma.config.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
  return NextResponse.json({ config });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "권한이 없어요." }, { status: 403 });

  const { deadline, closed, minEvaluators } = await req.json();
  const data: { deadline?: Date | null; closed?: boolean; minEvaluators?: number } = {};
  if (deadline !== undefined) data.deadline = deadline ? new Date(deadline) : null;
  if (typeof closed === "boolean") data.closed = closed;
  if (typeof minEvaluators === "number" && minEvaluators >= 1) data.minEvaluators = Math.floor(minEvaluators);

  const config = await prisma.config.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, ...data },
  });
  return NextResponse.json({ config });
}
