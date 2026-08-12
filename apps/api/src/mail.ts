import { createHash, randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
import { and, eq, isNull, gt } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import {
  hashPassword,
  schema,
  type AppDb,
} from "@open-filament/db";

function hashResetToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

function mailFrom(): string {
  return process.env.MAIL_FROM?.trim() || "OpenFilament <info@openfilament.nl>";
}

export async function sendPlainEmail(to: string, subject: string, body: string) {
  const message = [
    `From: ${mailFrom()}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=utf-8",
    "",
    body,
    "",
  ].join("\r\n");

  await new Promise<void>((resolve, reject) => {
    const child = spawn("sendmail", ["-t", "-i"], { stdio: ["pipe", "ignore", "pipe"] });
    let err = "";
    child.stderr.on("data", (chunk) => {
      err += String(chunk);
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(err || `sendmail exited ${code}`));
    });
    child.stdin.end(message);
  });
}

export async function sendShopOrderNotification(input: {
  to: string;
  orderUuid: string;
  email: string;
  amountCents: number;
  currency: string;
  items: { title: string; quantity: number; unitAmountCents: number }[];
  shippingJson?: string | null;
}) {
  const body = [
    "New OpenFilament shop order paid.",
    "",
    `Order: ${input.orderUuid}`,
    `Customer email: ${input.email}`,
    `Total: ${input.currency.toUpperCase()} ${(input.amountCents / 100).toFixed(2)}`,
    "",
    "Items:",
    ...input.items.map(
      (i) =>
        `- ${i.quantity}x ${i.title} (${input.currency.toUpperCase()} ${(i.unitAmountCents / 100).toFixed(2)} each)`,
    ),
    "",
    "Shipping:",
    input.shippingJson || "(not provided)",
    "",
    "— OpenFilament",
  ].join("\n");
  await sendPlainEmail(input.to, `OpenFilament shop order ${input.orderUuid}`, body);
}

export async function createPasswordResetAndNotify(
  db: AppDb,
  user: { id: number; email: string },
  publicBaseUrl: string,
) {
  const raw = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  db.insert(schema.passwordResetTokens)
    .values({
      uuid: uuid(),
      userId: user.id,
      tokenHash: hashResetToken(raw),
      expiresAt,
    })
    .run();

  const link = `${publicBaseUrl.replace(/\/$/, "")}/login/reset?token=${encodeURIComponent(raw)}`;
  const body = [
    "You asked to reset your OpenFilament password.",
    "",
    `Open this link within one hour:`,
    link,
    "",
    "If you did not ask for this, you can ignore this email.",
    "",
    "— OpenFilament",
  ].join("\n");

  try {
    await sendPlainEmail(user.email, "Reset your OpenFilament password", body);
  } catch (err) {
    // Token remains usable; ops can resend. Log without leaking the raw token.
    console.error("password_reset_mail_failed", err instanceof Error ? err.message : err);
  }
}

export async function consumePasswordResetToken(
  db: AppDb,
  rawToken: string,
  newPassword: string,
): Promise<boolean> {
  const now = new Date().toISOString();
  const tokenHash = hashResetToken(rawToken);
  const row = db
    .select()
    .from(schema.passwordResetTokens)
    .where(
      and(
        eq(schema.passwordResetTokens.tokenHash, tokenHash),
        isNull(schema.passwordResetTokens.usedAt),
        gt(schema.passwordResetTokens.expiresAt, now),
      ),
    )
    .get();
  if (!row) return false;

  const passwordHash = await hashPassword(newPassword);
  db.update(schema.users)
    .set({ passwordHash, updatedAt: now })
    .where(eq(schema.users.id, row.userId))
    .run();
  db.update(schema.passwordResetTokens)
    .set({ usedAt: now })
    .where(eq(schema.passwordResetTokens.id, row.id))
    .run();
  return true;
}
