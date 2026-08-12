import { RfidForm } from "./rfid-form";
import type { Metadata } from "next";
import { getLocaleMessages } from "@/lib/messages";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const { messages } = await getLocaleMessages();
  return buildPageMetadata({
    title: messages.rfid.heading,
    description: messages.rfid.warning,
    path: "/rfid",
  });
}

export default async function RfidPage() {
  const { messages } = await getLocaleMessages();

  return (
    <div>
      <h1>{messages.rfid.heading}</h1>
      <p className="muted">{messages.rfid.warning}</p>
      <RfidForm />
    </div>
  );
}
