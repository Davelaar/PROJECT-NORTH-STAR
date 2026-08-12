import { RegisterForm } from "./register-form";
import type { Metadata } from "next";
import { getLocaleMessages } from "@/lib/messages";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const { messages } = await getLocaleMessages();
  return buildPageMetadata({
    title: messages.login.registerHeading,
    description: messages.login.registerLead,
    path: "/register",
    noIndex: true,
  });
}

export default async function RegisterPage() {
  const { messages } = await getLocaleMessages();

  return (
    <div>
      <h1>{messages.login.registerHeading}</h1>
      <RegisterForm />
    </div>
  );
}
