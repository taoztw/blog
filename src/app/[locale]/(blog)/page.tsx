import React from "react";
import { useTranslations } from "next-intl";

const Page = () => {
  const t = useTranslations("HomePage");
  return <div>Page</div>;
};

export default Page;
