import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

export const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
) => {
  console.log("Hola esde hello");

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello World" }),
    headers: {
      "content-type": "application/json",
    },
  };
};
