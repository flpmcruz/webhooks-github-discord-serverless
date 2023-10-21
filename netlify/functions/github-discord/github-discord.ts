import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import * as crypto from "crypto";

const onStar = (payload: any): string => {
  const { sender, repository, action } = payload;

  return `User ${sender.login} ${action} star on the repository ${repository.full_name}`;
};

const onIssue = (payload: any): string => {
  const { action, issue, repository } = payload;

  if (action === "opened")
    return `New issue ${issue.title} on the repository ${repository.full_name}`;

  if (action === "closed")
    return `Issue ${issue.title} closed on the repository ${repository.full_name} by ${issue.user.login}`;

  if (action === "reopened")
    return `Issue ${issue.title} reopened on the repository ${repository.full_name} by ${issue.user.login}`;

  return `Action ${action} not supported`;
};

const notify = async (message: string) => {
  const body = {
    content: message,
  };
  const resp = await fetch(process.env.DISCORD_WEBHOOK_URL ?? "", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    console.error("Error sending message to Discord");
    return false;
  }
  return true;
};

const githubHandler = async (event: HandlerEvent) => {
  const payload = JSON.parse(event.body ?? "{}");
  const githubEvent = event.headers["x-github-event"] ?? "unknown";
  let message: string;

  switch (githubEvent) {
    case "star":
      message = onStar(payload);
      break;

    case "issues":
      message = onIssue(payload);
      break;

    default:
      message = `Event ${githubEvent} not supported`;
  }

  await notify(message);
};

const verify_signature = (event: HandlerEvent) => {
  try {
    const signature = crypto
      .createHmac("sha256", process.env.WEBHOOK_SECRET ?? "")
      .update(JSON.stringify(event.body))
      .digest("hex");
    const xHubSignature = event.headers["x-hub-signature-256"] ?? "";

    let trusted = Buffer.from(`sha256=${signature}`, "ascii");
    let untrusted = Buffer.from(xHubSignature, "ascii");

    return crypto.timingSafeEqual(trusted, untrusted);
  } catch (error) {
    return false;
  }
};

export const handler: Handler = async (event: HandlerEvent) => {
  // Verify signature to avoid unauthorized requests
  if (!verify_signature(event)) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "No autorizado" }),
      headers: { "content-type": "application/json" },
    };
  }
  await githubHandler(event);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello World" }),
    headers: {
      "content-type": "application/json",
    },
  };
};
