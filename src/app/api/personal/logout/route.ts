import { NextResponse } from "next/server";
import { destroyPersonalSession } from "@/lib/personalSession";

export async function POST() {
  await destroyPersonalSession();
  return NextResponse.json({ ok: true });
}
