/* ═══════════════════════════════════════════════════════════════════
   Pytomatiza+ Communication Page
   Multi-channel message composer with scheduling.
   ═══════════════════════════════════════════════════════════════════ */

import { type Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { locales } from "@/i18n/config";
import { Skeleton } from "@/components/ui/Skeleton";
import { CommunicationContent } from "./CommunicationContent";

interface CommunicationPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: CommunicationPageProps): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "meta.communication" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}/communication`,
      languages: Object.fromEntries(
        locales.map((l) => [l, `/${l}/communication`])
      ),
    },
  };
}

function CommunicationSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-4 w-72" />
      <Skeleton className="h-[300px] w-full rounded-[var(--radius-lg)]" />
      <Skeleton className="h-[220px] w-full rounded-[var(--radius-lg)]" />
    </div>
  );
}

export default async function CommunicationPage({ params }: CommunicationPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="space-y-8">
      <Suspense fallback={<CommunicationSkeleton />}>
        <CommunicationContent />
      </Suspense>
    </div>
  );
}
