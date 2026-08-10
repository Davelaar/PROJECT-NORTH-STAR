import { getApiBase } from "@/lib/api";
import { messages } from "@/lib/messages/en";

export default function DocsApiPage() {
  const openapiUrl = `${getApiBase()}/openapi.json`;
  return (
    <div>
      <h1>{messages.docsApi.heading}</h1>
      <p>{messages.docsApi.body}</p>
      <p>
        <a href={openapiUrl} target="_blank" rel="noreferrer">
          {messages.docsApi.openLink}
        </a>
      </p>
      <p className="muted">
        Also see repository docs: docs/API.md
      </p>
    </div>
  );
}
