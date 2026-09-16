import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getPersonalSessionId } from "@/lib/personalSession";

export async function GET() {
  const accountId = await getPersonalSessionId();
  if (!accountId) return NextResponse.json({ account: null });

  const account = await prisma.publicAccount.findUnique({ where: { id: accountId } });
  if (!account) return NextResponse.json({ account: null });

  return NextResponse.json({
    account: {
      id: account.id,
      name: account.name,
      shareToken: account.shareToken,
      closed: account.closed,
      minEvaluators: account.minEvaluators,
      hasSharePassword: !!account.sharePasswordHash,
    },
  });
}
