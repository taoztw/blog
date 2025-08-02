import { env } from "@/env";
import { ProxyAgent, setGlobalDispatcher } from "undici";

// https://github.com/nextauthjs/next-auth/issues/3920
if (env.HTTP_PROXY && process && env.NODE_ENV !== "production") {
	setGlobalDispatcher(new ProxyAgent(env.HTTP_PROXY));
	console.log("[Undici] Proxy enabled →", env.HTTP_PROXY);
}
