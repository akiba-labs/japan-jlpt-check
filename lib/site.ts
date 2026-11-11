export const SITE_NAME = "Japan JLPT Level Check";

export const SITE_TAGLINE =
  "Which JLPT level do you need in Japan? Enter N1–N5 (and your score) to see which visa and status Japanese rules it meets: HSP points, the Business Manager B2 rule, Designated Activities 46, Specified Skilled Worker N4, the B1 factor for permanent residence from April 2027, and your official CEFR level.";

export const DISCLAIMER_SHORT =
  "Educational checker, not immigration or legal advice; not affiliated with the Immigration Services Agency of Japan, the Ministry of Justice or the JLPT organisers. ISA decides; confirm before you rely on a result.";

export const HONESTY =
  "Rules as of 2026-11-09 from JLPT's official Advantages and CEFR reference pages and ISA's pages on HSP points, Designated Activities 46, the 2025-10-16 Business Manager revision, Specified Skilled Worker fields, 育成就労 and the 2026-10-01 permanent-residence guideline. It works from what you type; it cannot see your certificate.";

export const SIBLING_TOOLS = [
  { href: "https://japan-graduate-visa.vercel.app", label: "Japan Graduate Visa Check" },
  { href: "https://japan-visa-renewal.vercel.app", label: "Japan Visa Renewal Check" },
  { href: "https://japan-job-loss.vercel.app", label: "Japan Job Loss Check" },
  { href: "https://japan-medical-cost-cap.vercel.app", label: "Japan High-Cost Medical Expense Check" },
  { href: "https://japan-lost-item.vercel.app", label: "Japan Lost Item Check" },
  { href: "https://japan-leaving-tax.vercel.app", label: "Japan Leaving Tax Check" },
  { href: "https://japan-disaster-prep.vercel.app", label: "Japan Disaster Prep Check" },
  { href: "https://japan-parttime-check.vercel.app", label: "Japan Part-time Work Check" },
  { href: "https://japan-reentry-check.vercel.app", label: "Japan Re-entry Deadline Check" },
  { href: "https://japan-visa-fee.vercel.app", label: "Japan Visa Fee Calculator" },
  { href: "https://japan-pr-check.vercel.app", label: "Japan PR Guideline Check" },
  { href: "https://japan-hsp-points.vercel.app", label: "Japan HSP Points Calculator" },
  { href: "https://japan-mynumber-card-check.vercel.app", label: "Japan My Number Card Check" },
  { href: "https://japan-pet-quarantine.vercel.app", label: "Japan Pet Quarantine Check" },
  { href: "https://japan-overseas-dependents.vercel.app", label: "Japan Overseas Dependents Check" },
  { href: "https://japan-driving-check.vercel.app", label: "Japan Driving Check" },
  { href: "https://japan-tb-screening.vercel.app", label: "Japan TB Screening Check" },
  { href: "https://japan-customs-allowance.vercel.app", label: "Japan Customs Allowance" },
  { href: "https://japan-luggage.vercel.app", label: "Japan Luggage Check" },
  { href: "https://japan-tax-free-refund.vercel.app", label: "Japan Tax-Free Refund" },
  { href: "https://japan-intl-postage.vercel.app", label: "Japan Postage Calculator" },
  { href: "https://japan-alert-decoder.vercel.app", label: "Japan Alert Decoder" },
  { href: "https://japan-dual-pricing.vercel.app", label: "Japan Dual Pricing Check" },
  { href: "https://kyushu-travel-discount.vercel.app", label: "Kyushu Travel Discount" },
  { href: "https://house-rules-check.vercel.app", label: "House Rules Check" },
  { href: "https://japan-trip-brain.vercel.app", label: "Japan Trip Brain" },
  { href: "https://free-agent-tools.vercel.app", label: "Free Agent Tools MCP" },
] as const;

export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (production) return `https://${production.replace(/^https?:\/\//, "")}`;
  return "https://japan-jlpt-check.vercel.app";
}
