import Link from "next/link";
import { getLocaleMessages } from "@/lib/messages";

export default async function IdentifyPage() {
  const { messages: m } = await getLocaleMessages();
  return (
    <div className="stack">
      <h1>{m.identify.heading}</h1>
      <p className="home-lead">{m.identify.lead}</p>
      <div className="identify-cards">
        <Link className="identify-card" href="/search">
          <h2>{m.identify.manualTitle}</h2>
          <p>{m.identify.manualBody}</p>
        </Link>
        <Link className="identify-card" href="/scan">
          <h2>{m.identify.qrTitle}</h2>
          <p>{m.identify.qrBody}</p>
        </Link>
        <Link className="identify-card" href="/rfid">
          <h2>{m.identify.rfidTitle}</h2>
          <p>{m.identify.rfidBody}</p>
        </Link>
      </div>
      <p className="muted">
        <Link href="/label">{m.home.printQr}</Link>
        {" · "}
        <Link href="/hardware">{m.nav.hardware}</Link>
      </p>
    </div>
  );
}
