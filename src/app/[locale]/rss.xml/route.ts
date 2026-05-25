import { getDB } from "@/server/db/db";
import { categorys, posts } from "@/server/db/schema";
import { routing } from "@/i18n/routing";
import { desc, eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

const RSS_MAX_ITEMS = 50;
const SITE_NAME = "Tz Blog";

const xmlEscape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const attrEscape = (s: string) => xmlEscape(s).replace(/"/g, "&quot;");

const cdataEscape = (s: string) => s.replace(/]]>/g, "]]]]><![CDATA[>");

export async function GET(
  request: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;
  const homeUrl = `${baseUrl}/${locale}`;
  const feedUrl = `${baseUrl}/${locale}/rss.xml`;

  const t = await getTranslations({ locale, namespace: "Footer" });
  const description = t("description");

  const db = await getDB();
  const rows = await db
    .select({
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      imageUrl: posts.imageUrl,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      categoryName: categorys.name,
    })
    .from(posts)
    .leftJoin(categorys, eq(posts.categoryId, categorys.id))
    .where(eq(posts.status, "published"))
    .orderBy(desc(posts.createdAt))
    .limit(RSS_MAX_ITEMS);

  const channelLang = locale === "zh" ? "zh-CN" : "en";
  const lastBuildDate = (rows[0]?.updatedAt ?? new Date()).toUTCString();

  const items = rows
    .map((post) => {
      const postUrl = `${baseUrl}/${locale}/blog/${post.slug}`;
      const pubDate = post.createdAt.toUTCString();
      const descHtml = post.imageUrl
        ? `<p><img src="${attrEscape(post.imageUrl)}" alt="${attrEscape(post.title)}" /></p><p>${xmlEscape(post.excerpt)}</p>`
        : `<p>${xmlEscape(post.excerpt)}</p>`;

      return `    <item>
      <title><![CDATA[${cdataEscape(post.title)}]]></title>
      <link>${xmlEscape(postUrl)}</link>
      <guid isPermaLink="true">${xmlEscape(postUrl)}</guid>
      <pubDate>${pubDate}</pubDate>${post.categoryName ? `\n      <category><![CDATA[${cdataEscape(post.categoryName)}]]></category>` : ""}
      <description><![CDATA[${cdataEscape(descHtml)}]]></description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title><![CDATA[${cdataEscape(SITE_NAME)}]]></title>
    <link>${xmlEscape(homeUrl)}</link>
    <description><![CDATA[${cdataEscape(description)}]]></description>
    <language>${channelLang}</language>
    <atom:link href="${attrEscape(feedUrl)}" rel="self" type="application/rss+xml" />
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
