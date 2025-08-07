import React from "react";
import { useTranslations } from "next-intl";
import { HeroPersonalColorful } from "@/components/home/hero-personal-colorful";
import RecentBlogSection from "@/components/home/recent-post";
import { Footer } from "@/components/layouts/footer";

const Page = () => {
  const t = useTranslations("HomePage");
  return (
    <div>
      <HeroPersonalColorful />
      <RecentBlogSection />
      {/* 最近的开源项目 */}
      {/* 哪些正在学习的开源项目 */}
    </div>
  );
};

export default Page;
