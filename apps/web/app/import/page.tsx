import { redirect } from "next/navigation";

/** Legacy route — contributions go through GitHub. */
export default function ImportPage() {
  redirect("/contribute");
}
