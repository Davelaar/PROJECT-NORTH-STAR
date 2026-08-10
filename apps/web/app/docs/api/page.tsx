import { getApiBase } from "@/lib/api";
import { getLocaleMessages } from "@/lib/messages";

export default async function DocsApiPage() {
  const { messages } = await getLocaleMessages();

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
        {messages.docsApi.repoDocsNote}
      </p>
    </div>
  );
}
