/**
 * Input safety utilities for user-submitted text.
 *
 * Two jobs:
 *  1. strip() — remove HTML/script tags so stored text is always plain text.
 *  2. containsHatefulContent() — catch slurs and very offensive phrases before
 *     they reach the database or the neighbour feed.
 *
 * The word list is deliberately short and unambiguous — only clear hate-speech
 * and slurs. Borderline words are NOT included to avoid false positives.
 */

// ── HTML stripping ────────────────────────────────────────────────────────────

/** Remove all HTML/XML tags and collapse whitespace. */
export function stripHtml(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, " ")   // remove tags
    .replace(/&[a-z#0-9]+;/gi, " ") // remove HTML entities
    .replace(/\s+/g, " ")
    .trim();
}

// ── Profanity / hate-speech filter ──────────────────────────────────────────
// Keep this list focused on clear, unambiguous slurs.
// Intentionally obfuscated here to avoid the source file itself being harmful.

const BLOCKED_PATTERNS: RegExp[] = [
  // Racial slurs
  /\bn[i!1][g9][g9][e3]r\b/i,
  /\bn[i!1][g9]{2}(a|er|ers|as)\b/i,
  /\bspic(s)?\b/i,
  /\bch[i1]nk(s)?\b/i,
  /\bk[i1]ke(s)?\b/i,
  /\bgook(s)?\b/i,
  /\bwetback(s)?\b/i,
  /\bcoon(s)?\b/i,
  /\bjap(s)?\b/i,
  /\btowelhead(s)?\b/i,
  /\bpakis?\b/i,
  /\bbeaner(s)?\b/i,
  // Homophobic / transphobic slurs
  /\bfagg?[o0]t(s)?\b/i,
  /\bdyke(s)?\b/i,
  /\btr[a4]nn[yi](e?s?)?\b/i,
  // Ableist slurs
  /\bret[a4]rd(ed|s)?\b/i,
  // Explicit death/violence wishes
  /\bkill\s+(your)?self\b/i,
  /\bkys\b/i,
  /\bi\s+hope\s+you\s+die\b/i,
  /\bgo\s+die\b/i,
  // Extreme obscenities directed at a person
  /\bf[u*]ck\s+(you|off|this)\b/i,
];

/**
 * Returns true if the text contains a blocked pattern.
 * Only called for user-supplied free-text fields.
 */
export function containsHatefulContent(text: string): boolean {
  const normalised = text
    .replace(/[@$!*]/g, (c) => {
      const map: Record<string, string> = { "@": "a", "$": "s", "!": "i", "*": "" };
      return map[c] ?? c;
    })
    .replace(/0/g, "o")
    .replace(/1/g, "i")
    .replace(/3/g, "e");

  return BLOCKED_PATTERNS.some((rx) => rx.test(normalised));
}

/**
 * Full pipeline for a single user-supplied string:
 *   strip HTML → trim → length cap → hate check.
 *
 * Returns { ok: true, value } or { ok: false, reason }.
 */
export function sanitizeText(
  raw: string | undefined | null,
  { maxLength = 500, fieldName = "field" }: { maxLength?: number; fieldName?: string } = {},
): { ok: true; value: string | null } | { ok: false; reason: string } {
  if (raw == null || raw.trim() === "") return { ok: true, value: null };

  const stripped = stripHtml(raw);

  if (stripped.length > maxLength) {
    return { ok: false, reason: `${fieldName} is too long (max ${maxLength} characters).` };
  }

  if (containsHatefulContent(stripped)) {
    return { ok: false, reason: `${fieldName} contains content that isn't allowed.` };
  }

  return { ok: true, value: stripped };
}
