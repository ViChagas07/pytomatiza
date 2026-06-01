/* ═══════════════════════════════════════════════════════════════════
   Pytomatiza+ Dashboard Page
   Server component that fetches dashboard data and streams it via
   Suspense boundaries to the client.

   Resilience: when the backend is unreachable, a flag is passed
   to the client so it can render zeroed stats + an offline banner
   instead of a hard error.
   ═══════════════════════════════════════════════════════════════════ */

import { type Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { locales } from "@/i18n/config";
import {
  StatsSkeleton,
  AgentCardsSkeleton,
} from "@/components/dashboard/DashboardSkeletons";
import {
  serverFetch,
  type DashboardStats,
  type BackendAgentListResponse,
  type AgentListResult,
  type ApiError,
  mapAgentToFrontend,
  isNetworkError,
  EMPTY_DASHBOARD_STATS,
} from "@/lib/api";
import { DashboardContent } from "./DashboardContent";

/* ── Props ────────────────────────────────────────────────────────── */

interface DashboardPageProps {
  params: Promise<{ locale: string }>;
}

/* ── generateMetadata ─────────────────────────────────────────────── */

export async function generateMetadata({
  params,
}: DashboardPageProps): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "meta.dashboard" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}/dashboard`,
      languages: Object.fromEntries(
        locales.map((l) => [l, `/${l}/dashboard`])
      ),
    },
  };
}

/* ── Data fetching helpers ────────────────────────────────────────── */

async function fetchStats(): Promise<{
  stats: DashboardStats | null;
  error: ApiError | null;
}> {
  const res = await serverFetch<DashboardStats>("/dashboard/stats");
  return { stats: res.data, error: res.error };
}

async function fetchAgentsData(): Promise<{
  agents: AgentListResult | null;
  error: ApiError | null;
}> {
  const res = await serverFetch<BackendAgentListResponse>("/agents");
  if (!res.data) return { agents: null, error: res.error };

  return {
    agents: {
      items: res.data.items.map(mapAgentToFrontend),
      total: res.data.total,
      page: res.data.page,
      pageSize: res.data.per_page,
      totalPages: res.data.pages,
    },
    error: null,
  };
}

/* ── Page ─────────────────────────────────────────────────────────── */

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="space-y-8">
      {/* Stats section — streamed from server */}
      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">
          Key metrics
        </h2>
        <Suspense fallback={<StatsSkeleton />}>
          <StatsSection />
        </Suspense>
      </section>

      {/* Agent cards grid — streamed from server */}
      <section aria-labelledby="agents-heading">
        <h2 id="agents-heading" className="sr-only">
          Agent overview
        </h2>
        <Suspense fallback={<AgentCardsSkeleton />}>
          <AgentsSection />
        </Suspense>
      </section>
    </div>
  );
}

/* ── Async Server Components for streaming ────────────────────────── */

/**
 * Stats section — fetches dashboard stats on the server.
 * Rendered inside a Suspense boundary for streaming.
 */
async function StatsSection() {
  const { stats, error } = await fetchStats();

  // When backend is unreachable, pass zeroed stats so the UI renders;
  // the client will show an offline banner.
  const displayStats = isNetworkError(error) && error
    ? EMPTY_DASHBOARD_STATS
    : stats;

  return (
    <DashboardContent
      section="stats"
      initialStats={displayStats}
      initialAgents={[]}
      serverError={error}
    />
  );
}

/**
 * Agents section — fetches agents on the server.
 * Rendered inside a Suspense boundary for streaming.
 */
async function AgentsSection() {
  const { agents, error } = await fetchAgentsData();

  // For network errors, pass empty agents list so UI renders
  const displayAgents = isNetworkError(error) && error
    ? []
    : (agents?.items ?? []);

  return (
    <DashboardContent
      section="agents"
      initialStats={null}
      initialAgents={displayAgents}
      serverError={error}
    />
  );
}
