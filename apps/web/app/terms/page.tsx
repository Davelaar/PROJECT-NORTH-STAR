import { permanentRedirect } from "next/navigation";

/** Canonical URL is /terms-of-service */
export default function TermsRedirectPage() {
  permanentRedirect("/terms-of-service");
}
