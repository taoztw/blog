import React from "react";
import { useTranslations } from "next-intl";
import { HeroPersonalColorful } from "@/components/home/hero-personal-colorful";

const Page = () => {
  const t = useTranslations("HomePage");
  return (
    <div>
      <HeroPersonalColorful />
    </div>
  );
};

export default Page;
