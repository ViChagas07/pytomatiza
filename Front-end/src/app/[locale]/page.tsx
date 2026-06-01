/* ═══════════════════════════════════════════════════════════════════
   Pytomatiza+ Locale Root Redirect
   All traffic entering /[locale] is sent to the dashboard.
   ═══════════════════════════════════════════════════════════════════ */

import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

interface LocaleRootPageProps {
  params: Promise<{ locale: string }>;
}

export default async function LocaleRootPage({ params }: LocaleRootPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  redirect(`/${locale}/dashboard`);
}
