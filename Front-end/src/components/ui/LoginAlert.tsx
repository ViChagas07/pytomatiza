"use client";

import { LogIn, ArrowRight } from "lucide-react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { useSession } from "next-auth/react";

/**
 * Amber login prompt used across dashboard pages.
 * Shown when the user is NOT authenticated.
 * The entire bar is clickable → redirects to /:locale/login.
 *
 * @param label - Translated prompt text (e.g. "Faça login em sua conta…" or "Log in to your account…")
 */
export function LoginAlert({ label }: { label: string }) {
  const locale = useLocale();
  const { status } = useSession();
  const isSessionLoaded = status !== "loading";
  const isAuthenticated = status === "authenticated";

  if (!isSessionLoaded || isAuthenticated) return null;

  return (
    <Link
      href={`/${locale}/login`}
      className="flex items-center gap-4 rounded-[var(--radius-lg)] border border-amber-300/60 bg-amber-50 px-5 py-3 text-sm cursor-pointer transition-colors hover:bg-amber-100 no-underline"
      role="alert"
    >
      <LogIn className="h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
      <span className="text-amber-800 font-medium flex-1">{label}</span>
      <ArrowRight className="h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
    </Link>
  );
}
