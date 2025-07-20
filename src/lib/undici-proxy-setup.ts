import { ProxyAgent, setGlobalDispatcher } from "undici";

if (process.env.HTTP_PROXY) {
	setGlobalDispatcher(new ProxyAgent(process.env.HTTP_PROXY));
	console.log("[Undici] Proxy enabled →", process.env.HTTP_PROXY);
}
