"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { localizedPath } from "@/lib/i18n/routing";
import { useLocale } from "./messages-provider";

type Props = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
};

/** Next Link that prefixes the active locale (`/nl/...`). */
export function LocaleLink({ href, ...rest }: Props) {
  const locale = useLocale();
  const path = href.startsWith("http") || href.startsWith("//") || href.startsWith("#")
    ? href
    : localizedPath(locale, href);
  return <Link href={path} {...rest} />;
}
