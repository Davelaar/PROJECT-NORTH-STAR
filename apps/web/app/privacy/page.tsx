import { permanentRedirect } from "next/navigation";

/** Canonical URL is /privacy-policy */
export default function PrivacyRedirectPage() {
  permanentRedirect("/privacy-policy");
}
