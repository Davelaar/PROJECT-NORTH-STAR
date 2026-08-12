import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Admin",
    description: "OpenFilament operator tools",
    path: "/admin",
    noIndex: true,
  });
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
