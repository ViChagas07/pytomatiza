/* ═══════════════════════════════════════════════════════════════════
   Pytomatiza+ Agents Page
   Server component that fetches agent data and streams it.
   ═══════════════════════════════════════════════════════════════════ */

import { type Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { locales } from "@/i18n/config";
import { AgentCardsSkeleton } from "@/components/dashboard/DashboardSkeletons";
import {
  serverFetch,
  type BackendAgentListResponse,
  mapAgentToFrontend,
} from "@/lib/api";
import type { Agent } from "@/store";
import { AgentsContent } from "./AgentsContent";

/* ── Props ────────────────────────────────────────────────────────── */

interface AgentsPageProps {
  params: Promise<{ locale: string }>;
}

/* ── generateMetadata ─────────────────────────────────────────────── */

export async function generateMetadata({
  params,
}: AgentsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.agents" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}/agents`,
      languages: Object.fromEntries(
        locales.map((l) => [l, `/${l}/agents`])
      ),
    },
  };
}

/* ── Data fetching helper ─────────────────────────────────────────── */

async function fetchAgents(): Promise<Agent[]> {
  const res = await serverFetch<BackendAgentListResponse>("/agents");
  if (!res.data) return [];
  return res.data.items.map(mapAgentToFrontend);
}

/* ── Page ─────────────────────────────────────────────────────────── */

export default function AgentsPage() {
  return (
    <div className="space-y-8">
      <Suspense fallback={<AgentCardsSkeleton />}>
        <AgentsSection />
      </Suspense>
    </div>
  );
}

/* ── Async Server Component for streaming ─────────────────────────── */

async function AgentsSection() {
  const agents = await fetchAgents();

  return <AgentsContent initialAgents={agents} />;
}
