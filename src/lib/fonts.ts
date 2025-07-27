import localFont from "next/font/local";

export const geist = localFont({
	// 按 weight/style 列出
	src: [
		{ path: "/fonts/geist/Geist-Thin.ttf", weight: "100", style: "normal" },
		{ path: "/fonts/geist/Geist-ExtraLight.ttf", weight: "200", style: "normal" },
		{ path: "/fonts/geist/Geist-Light.ttf", weight: "300", style: "normal" },
		{ path: "/fonts/geist/Geist-Regular.ttf", weight: "400", style: "normal" },
		{ path: "/fonts/geist/Geist-Medium.ttf", weight: "500", style: "normal" },
		{ path: "/fonts/geist/Geist-SemiBold.ttf", weight: "600", style: "normal" },
		{ path: "/fonts/geist/Geist-Bold.ttf", weight: "700", style: "normal" },
		{ path: "/fonts/geist/Geist-ExtraBold.ttf", weight: "800", style: "normal" },
		{ path: "/fonts/geist/Geist-Black.ttf", weight: "900", style: "normal" }
	],
	display: "swap",
	variable: "--font-geist-sans"
});
