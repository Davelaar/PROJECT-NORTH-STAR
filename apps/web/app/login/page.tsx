import { LoginForm } from "./login-form";
import type { Metadata } from "next";
import { getLocaleMessages } from "@/lib/messages";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const { messages } = await getLocaleMessages();
  return buildPageMetadata({
    title: messages.login.heading,
    description: messages.login.privacyMinimal,
    path: "/login",
    noIndex: true,
  });
}

export default async function LoginPage() {
  const { messages } = await getLocaleMessages();

  return (
    <div>
      <h1>{messages.login.heading}</h1>
      <p className="muted">{messages.login.privacyMinimal}</p>
      <LoginForm />
    </div>
  );
}
