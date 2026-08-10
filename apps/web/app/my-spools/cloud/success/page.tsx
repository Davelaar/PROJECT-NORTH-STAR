import { Suspense } from "react";
import CloudCheckoutSuccessClient from "./success-client";

export default function Page() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <CloudCheckoutSuccessClient />
    </Suspense>
  );
}
