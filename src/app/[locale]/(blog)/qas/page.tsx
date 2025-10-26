"use client";

import { useTranslations } from "next-intl";

export default function QAsPage() {
  const t = useTranslations("QAPage.comingSoon");

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center space-y-8">
          <h1 className="text-4xl font-bold">{t("title")}</h1>

          <div className="max-w-2xl mx-auto space-y-6">
            <p className="text-xl text-muted-foreground">{t("subtitle")}</p>

            <div className="bg-card rounded-lg border p-8 space-y-4 text-left">
              <h2 className="text-2xl font-semibold">{t("whatIs")}</h2>

              <div className="space-y-3 text-muted-foreground">
                <p>{t("description")}</p>

                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>{t("features.quick")}</li>
                  <li>{t("features.voting")}</li>
                  <li>{t("features.tags")}</li>
                  <li>{t("features.tracking")}</li>
                  <li>{t("features.views")}</li>
                </ul>

                <p className="pt-2">{t("perfect")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
