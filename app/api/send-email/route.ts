import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { sendCustomEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { to, subject, message, branded } = await req.json();
  if (!to || !subject || !message) {
    return NextResponse.json({ error: "Попълнете получател, тема и съобщение." }, { status: 400 });
  }

  try {
    await sendCustomEmail({ to: String(to).trim(), subject, message, branded: branded !== false });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: `Грешка при изпращане: ${e instanceof Error ? e.message : String(e)}` }, { status: 500 });
  }
}
