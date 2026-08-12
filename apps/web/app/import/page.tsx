import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Import",
    description: "Legacy import — contributions go through GitHub",
    path: "/import",
    noIndex: true,
  });
}

/** Legacy route — contributions go through GitHub. */
export default function ImportPage() {
  redirect("/contribute");
}
