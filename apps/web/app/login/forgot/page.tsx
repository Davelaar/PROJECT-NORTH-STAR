import { ForgotPasswordForm } from "./forgot-form";
import { getLocaleMessages } from "@/lib/messages";

export default async function ForgotPasswordPage() {
  const { messages } = await getLocaleMessages();

  return (
    <div>
      <h1>{messages.login.forgotHeading}</h1>
      <ForgotPasswordForm />
    </div>
  );
}
