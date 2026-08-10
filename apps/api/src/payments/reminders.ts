import type { ReminderKind } from "@open-filament/db";
import { spawn } from "node:child_process";

/**
 * Transactional expiry notices — not marketing.
 * Every message states there is no automatic renewal and no payment will be taken.
 */
export async function sendCloudExpiryReminder(input: {
  to: string;
  kind: ReminderKind;
  paidUntil: string | null;
  deletionScheduledAt: string | null;
}): Promise<void> {
  const subject =
    input.kind === "d30"
      ? "My Spools Cloud expires in 30 days"
      : input.kind === "d7"
        ? "My Spools Cloud expires in 7 days"
        : input.kind === "expired"
          ? "My Spools Cloud access has ended"
          : "My Spools Cloud data deletion approaching";

  const text = [
    "Hello,",
    "",
    subject + ".",
    input.paidUntil ? `Paid-until date: ${input.paidUntil}` : "",
    input.deletionScheduledAt
      ? `Cloud data deletion scheduled around: ${input.deletionScheduledAt}`
      : "",
    "",
    "My Spools Cloud does not renew automatically.",
    "No payment will be taken.",
    "If you want to continue, purchase another 12 months manually.",
    "",
    "Export remains available during the documented grace and retention windows.",
    "Open: https://openfilament.nl/my-spools/cloud",
    "",
    "— OpenFilament",
  ]
    .filter(Boolean)
    .join("\n");

  if (process.env.CLOUD_REMINDER_DRY_RUN === "true") {
    console.info("[cloud-reminder-dry-run]", { to: input.to, subject });
    return;
  }

  const from = process.env.MAIL_FROM ?? "info@openfilament.nl";
  // Prefer local sendmail (Postfix on the VPS).
  await new Promise<void>((resolve) => {
    const child = spawn("sendmail", ["-t"], { stdio: ["pipe", "ignore", "ignore"] });
    child.on("error", () => {
      console.warn("[cloud-reminder] sendmail unavailable; logged only", {
        to: input.to,
        subject,
      });
      resolve();
    });
    child.on("close", () => resolve());
    child.stdin.write(
      `From: ${from}\nTo: ${input.to}\nSubject: ${subject}\nContent-Type: text/plain; charset=utf-8\n\n${text}\n`,
    );
    child.stdin.end();
  });
}
