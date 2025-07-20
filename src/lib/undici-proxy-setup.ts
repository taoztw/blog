import { ProxyAgent, setGlobalDispatcher } from "undici";

// https://github.com/nextauthjs/next-auth/issues/3920
if (process.env.HTTP_PROXY) {
	setGlobalDispatcher(new ProxyAgent(process.env.HTTP_PROXY));
	console.log("[Undici] Proxy enabled →", process.env.HTTP_PROXY);
}
