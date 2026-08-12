import { ForgotPasswordForm } from "./forgot-form";
import type { Metadata } from "next";
import { getLocaleMessages } from "@/lib/messages";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const { messages } = await getLocaleMessages();
  return buildPageMetadata({
    title: messages.login.forgotHeading,
    description: messages.login.forgotLead,
    path: "/login/forgot",
    noIndex: true,
  });
}

export default async function ForgotPasswordPage() {
  const { messages } = await getLocaleMessages();

  return (
    <div>
      <h1>{messages.login.forgotHeading}</h1>
      <ForgotPasswordForm />
    </div>
  );
}
