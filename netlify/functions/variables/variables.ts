import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

export const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
) => {
  const myImportantVariable = process.env.MY_IMPORTANT_VARIABLE;

  // No lanzar excepciones en producción, mejor manejar el error con trycatch y dar una respuesta
  // if (!myImportantVariable) throw "No variable found";

  console.log("Hola esde variables");

  return {
    statusCode: 200,
    body: JSON.stringify({myImportantVariable}),
    headers: {
      "content-type": "application/json",
    },
  };
};
