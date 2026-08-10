import { RfidForm } from "./rfid-form";
import { messages } from "@/lib/messages/en";

export default function RfidPage() {
  return (
    <div>
      <h1>{messages.rfid.heading}</h1>
      <div className="banner-warn">{messages.rfid.warning}</div>
      <RfidForm />
    </div>
  );
}
