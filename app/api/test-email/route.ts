import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import nodemailer from "nodemailer";

// Admin-only diagnostic: checks SMTP config + attempts a real send, returns the actual error.
export async function GET() {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "465");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  const config = {
    SMTP_HOST: host || "(missing)",
    SMTP_PORT: process.env.SMTP_PORT || "(missing)",
    SMTP_USER: user || "(missing)",
    SMTP_PASS: pass ? `set (${pass.length} chars)` : "(missing)",
    secure: port === 465,
  };

  if (!host || !user || !pass) {
    return NextResponse.json({ ok: false, step: "config", config, message: "One or more SMTP env vars are missing." });
  }

  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
  });

  // Step 1: verify connection
  try {
    await transport.verify();
  } catch (e) {
    return NextResponse.json({
      ok: false,
      step: "verify",
      config,
      error: String(e instanceof Error ? e.message : e),
    });
  }

  // Step 2: actually send a test email to the mailbox itself
  try {
    const info = await transport.sendMail({
      from: `Premium Perfumes <${user}>`,
      to: user,
      subject: "Тест имейл — Premium Perfumes",
      text: "Това е тестово съобщение. Ако го виждате, SMTP работи коректно.",
    });
    return NextResponse.json({ ok: true, step: "sent", config, messageId: info.messageId, response: info.response });
  } catch (e) {
    return NextResponse.json({
      ok: false,
      step: "send",
      config,
      error: String(e instanceof Error ? e.message : e),
    });
  }
}
