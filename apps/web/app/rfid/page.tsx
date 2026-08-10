import { RfidForm } from "./rfid-form";
import { getLocaleMessages } from "@/lib/messages";

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
