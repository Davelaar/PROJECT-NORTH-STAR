import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Account",
    description: "OpenFilament account",
    path: "/me",
    noIndex: true,
  });
}

export default function MeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
