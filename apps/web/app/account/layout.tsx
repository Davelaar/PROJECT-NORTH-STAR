import type { Metadata } from "next";
import { getLocaleMessages } from "@/lib/messages";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const { messages } = await getLocaleMessages();
  return buildPageMetadata({
    title: messages.account.heading,
    description: messages.account.sessions,
    path: "/account",
    noIndex: true,
  });
}

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
