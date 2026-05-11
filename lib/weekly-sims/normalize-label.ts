/**
 * Canonical label normalization for weeklySimulationResults rows.
 *
 * Why this exists: agent-generated labels are free-text (see
 * lib/agents/schemas/fight-edge-summary-schema.ts:45). For bet types that
 * have no fighter-name anchor — primarily GTD and DGTD — the LLM emits
 * slight wording variants of the same conceptual bet ("Fight Goes The
 * Distance" vs "Fight Goes the Distance" vs "Fight Goes The Distance
 * (GTD)"), which then appear as three separate rows downstream.
 *
 * Apply this at write time (cron insert path). The two admin query sites
 * use an equivalent SQL CASE expression so historical rows still collapse
 * cleanly in the dashboard even before any backfill.
 *
 * Keep the JS branches here in sync with the SQL CASE.
 */
export function normalizeLabel(betType: string, rawLabel: string): string {
  const label = (rawLabel ?? "").trim().replace(/\s+/g, " ");
  switch (betType) {
    case "GTD":
      return "Fight Goes The Distance";
    case "DGTD":
      return "Fight Doesn't Go The Distance";
    default:
      return label;
  }
}
