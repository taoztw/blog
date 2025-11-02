import { getAuth } from "@/lib/auth/auth"; // path to your auth file
function toNextJsHandler() {
  const handler = async (request: Request) => {
    const auth = await getAuth();
    return auth.handler(request);
  };
  return {
    GET: handler,
    POST: handler,
  };
}

export const { POST, GET } = toNextJsHandler();
