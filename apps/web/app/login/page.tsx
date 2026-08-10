import { LoginForm } from "./login-form";
import { messages } from "@/lib/messages/en";

export default function LoginPage() {
  return (
    <div>
      <h1>{messages.login.heading}</h1>
      <p className="muted">
        Seed users: admin / admin-change-me · fixture_contributor /
        contributor-change-me
      </p>
      <LoginForm />
    </div>
  );
}
