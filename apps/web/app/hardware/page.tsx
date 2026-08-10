import Link from "next/link";
import { AddPrinterForm } from "@/app/components/add-printer-form";
import { getLocaleMessages } from "@/lib/messages";

export default async function HardwarePage() {
  const { messages: m } = await getLocaleMessages();
  const h = m.hardware;
  return (
    <div>
      <h1>{h.heading}</h1>
      <p className="muted">{h.intro}</p>

      <AddPrinterForm />

      <section className="panel stack">
        <h2>{h.qrHeading}</h2>
        <p>
          {h.qrBody}{" "}
          <Link href="/label">{m.nav.label}</Link>
          {" · "}
          <Link href="/scan">{m.nav.scan}</Link>
        </p>
      </section>

      <section className="panel stack">
        <h2>{h.cfsHeading}</h2>
        <p>
          {h.cfsBody}{" "}
          <Link href="/rfid">{m.nav.rfid}</Link>
        </p>
      </section>

      <section className="panel stack">
        <h2>{h.optHeading}</h2>
        <p>{h.optBody}</p>
        <ul>
          <li>
            <a
              href="https://specs.openprinttag.org/"
              target="_blank"
              rel="noreferrer"
            >
              specs.openprinttag.org
            </a>
          </li>
        </ul>
      </section>

      <section className="panel stack">
        <p>
          <Link href="/rfid">{m.nav.rfid}</Link>
          {" · "}
          <Link href="/label">{m.nav.label}</Link>
          {" · "}
          <Link href="/scan">{m.nav.scan}</Link>
          {" · "}
          <Link href="/submit">{m.nav.submit}</Link>
        </p>
      </section>
    </div>
  );
}
