import type { Metadata } from "next";
import { getLocaleMessages } from "@/lib/messages";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const { messages } = await getLocaleMessages();
  return buildPageMetadata({
    title: messages.label.heading,
    description: messages.label.lead,
    path: "/label",
  });
}

export default function LabelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
