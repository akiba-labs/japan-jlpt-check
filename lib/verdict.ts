export const VERDICT_LABEL: Record<string, string> = {
  b2_plus: "B2 or higher",
  b1: "B1 level",
  a2: "A2 level",
  a1: "A1 level",
  none: "No JLPT pass",
};

export const VERDICT_STYLE: Record<string, string> = {
  b2_plus: "text-teal-100",
  b1: "text-teal-100",
  a2: "text-sky-100",
  a1: "text-amber-100",
  none: "text-rose-200",
};

export const STATUS_LABEL: Record<string, string> = {
  met: "Met",
  not_met: "Not met",
  exempt: "Exempt",
  points: "Points",
  no_points: "0 points",
  considered_met: "Factor met",
  considered_unclear: "Need score",
  considered_not_met: "Factor not met",
  not_considered: "Not considered",
  not_in_force_yet: "From 2027-04-01",
  not_required: "Not required",
  check_rules: "Check rules",
};

export const STATUS_STYLE: Record<string, string> = {
  met: "border-teal-400/40 text-teal-100",
  exempt: "border-teal-400/40 text-teal-100",
  points: "border-teal-400/40 text-teal-100",
  considered_met: "border-teal-400/40 text-teal-100",
  not_considered: "border-line text-muted",
  not_required: "border-line text-muted",
  not_in_force_yet: "border-sky-400/40 text-sky-100",
  check_rules: "border-amber-400/40 text-amber-100",
  considered_unclear: "border-amber-400/40 text-amber-100",
  no_points: "border-line text-muted",
  not_met: "border-rose-400/40 text-rose-200",
  considered_not_met: "border-rose-400/40 text-rose-200",
};
