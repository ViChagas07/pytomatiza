/* ═══════════════════════════════════════════════════════════════════
   Pytomatiza+ Layout — AuraBackground
   Animated aurora-borealis background that reflects the user's
   chosen accent color via CSS custom properties.
   Purely decorative. Respects .reduce-motion automatically.

   Client Component — randomizes the animation pattern for each
   blob every time the user navigates to a new route. This gives
   every page/section a distinct aura motion without a fixed
   pattern, making the experience feel organic and varied.

   Colors resolve from --brand-accent / --brand-accent-light
   which are set on :root by AccentColorScript and AppearanceSync.
   ═══════════════════════════════════════════════════════════════════ */

"use client";

import { type ReactNode, useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

interface AuraBackgroundProps {
  /** Optional: render additional content above the aura (e.g., overlay). */
  children?: ReactNode;
}

/* ── Randomisation helpers ─────────────────────────────────────── */

const VARIANT_COUNT = 6; // a, b, c, d, e, f

/** Pick a random integer in [0, VARIANT_COUNT) */
function randomVariant(): number {
  return Math.floor(Math.random() * VARIANT_COUNT);
}

/** Convert a numeric variant index (0–5) to the CSS class letter (a–f) */
function variantSuffix(index: number): string {
  return String.fromCharCode(97 + index); // 0→a, 1→b, …, 5→f
}

/** Build the full className for a blob position + variant */
function blobClass(blobNumber: 1 | 2 | 3, variant: number): string {
  return `aura-blob aura-blob-${blobNumber} aura-blob-${blobNumber}${variantSuffix(variant)}`;
}

/**
 * Fixed fullscreen container with three blur-gradient blobs
 * that drift slowly like the aurora borealis.
 *
 * ── Color scheme ──
 *   Blob 1 → --brand-accent (main accent color, higher opacity)
 *   Blob 2 → --brand-accent-light (subtle variant, medium opacity)
 *   Blob 3 → --brand-accent (main accent, lower opacity)
 *
 * ── Movement ──
 *   Each blob has 6 possible animation keyframe sets (a–f).
 *   A random combination is chosen on first mount and re-picked
 *   on every route change, giving each page its own unique aura.
 */
export function AuraBackground({ children }: AuraBackgroundProps) {
  const pathname = usePathname();
  const prevPathname = useRef<string>(pathname);

  /* On mount: randomise. On route change: re-randomise.           */
  const [v1, setV1] = useState<number>(randomVariant);
  const [v2, setV2] = useState<number>(randomVariant);
  const [v3, setV3] = useState<number>(randomVariant);

  useEffect(() => {
    if (prevPathname.current === pathname) return;
    prevPathname.current = pathname;
    setV1(randomVariant());
    setV2(randomVariant());
    setV3(randomVariant());
  }, [pathname]);

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none z-0"
      aria-hidden="true"
    >
      {/* ── Blob 1 — Top-left, large, uses main accent color ──────── */}
      <div
        className={blobClass(1, v1)}
        style={{
          background:
            "radial-gradient(ellipse 50% 50% at 50% 50%, var(--brand-accent) 0%, transparent 60%)",
        }}
      />

      {/* ── Blob 2 — Right side, medium, uses light accent tone ──── */}
      <div
        className={blobClass(2, v2)}
        style={{
          background:
            "radial-gradient(ellipse 50% 50% at 50% 50%, var(--brand-accent-light) 0%, transparent 65%)",
        }}
      />

      {/* ── Blob 3 — Bottom-center, smaller, uses main accent ────── */}
      <div
        className={blobClass(3, v3)}
        style={{
          background:
            "radial-gradient(ellipse 50% 50% at 50% 50%, var(--brand-accent) 0%, transparent 60%)",
        }}
      />

      {children}
    </div>
  );
}
