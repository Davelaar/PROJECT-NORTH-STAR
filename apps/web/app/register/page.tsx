import { RegisterForm } from "./register-form";
import { getLocaleMessages } from "@/lib/messages";

export default async function RegisterPage() {
  const { messages } = await getLocaleMessages();

  return (
    <div>
      <h1>{messages.login.registerHeading}</h1>
      <RegisterForm />
    </div>
  );
}
