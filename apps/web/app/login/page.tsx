import { LoginForm } from "./login-form";
import { getLocaleMessages } from "@/lib/messages";

export default async function LoginPage() {
  const { messages } = await getLocaleMessages();

  return (
    <div>
      <h1>{messages.login.heading}</h1>
      <p className="muted">{messages.login.privacyMinimal}</p>
      <LoginForm />
    </div>
  );
}
