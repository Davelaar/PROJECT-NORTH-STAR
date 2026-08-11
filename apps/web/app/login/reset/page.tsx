import { ResetPasswordForm } from "./reset-form";
import { getLocaleMessages } from "@/lib/messages";

export default async function ResetPasswordPage() {
  const { messages } = await getLocaleMessages();

  return (
    <div>
      <h1>{messages.login.resetHeading}</h1>
      <ResetPasswordForm />
    </div>
  );
}
