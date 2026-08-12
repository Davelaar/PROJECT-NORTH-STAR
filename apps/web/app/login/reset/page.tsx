import { ResetPasswordForm } from "./reset-form";
import type { Metadata } from "next";
import { getLocaleMessages } from "@/lib/messages";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const { messages } = await getLocaleMessages();
  return buildPageMetadata({
    title: messages.login.resetHeading,
    description: messages.login.resetSubmit,
    path: "/login/reset",
    noIndex: true,
  });
}

export default async function ResetPasswordPage() {
  const { messages } = await getLocaleMessages();

  return (
    <div>
      <h1>{messages.login.resetHeading}</h1>
      <ResetPasswordForm />
    </div>
  );
}
