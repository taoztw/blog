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
    </div>
  );
};

export default Page;
