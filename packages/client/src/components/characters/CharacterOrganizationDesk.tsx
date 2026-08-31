// ──────────────────────────────────────────────
// Character Organization Desk
// ──────────────────────────────────────────────
import { useTranslation } from "react-i18next";
import { Check, Info, X } from "lucide-react";
import type { CharacterOrganizationProposals, OrganizationConfidence } from "@marinara-engine/shared";
import { cn } from "../../lib/utils";

type CharacterOrganizationDeskProps = {
  proposals: CharacterOrganizationProposals | undefined;
  isLoading: boolean;
  /** Merge the duplicate spellings into the canonical tag. */
  onMergeTags: (canonicalLabel: string, duplicateKeys: string[], affected: number) => void;
  /** Add one suggested tag to one character. */
  onApplyTag: (characterId: string, tagLabel: string) => void;
  onDismiss: (id: string) => void;
  dismissed: ReadonlySet<string>;
  busy: boolean;
};

function ConfidenceBadge({ confidence }: { confidence: OrganizationConfidence }) {
  const { t } = useTranslation();
  return (
    <span
      className={cn(
        "rounded px-1.5 py-px text-[0.5625rem] font-medium uppercase tracking-wide",
        confidence === "high"
          ? "bg-[var(--secondary)] text-[var(--foreground)]"
          : "bg-[var(--secondary)]/60 text-[var(--muted-foreground)]",
      )}
    >
      {confidence === "high" ? t("characters.organize.confidenceHigh") : t("characters.organize.confidencePossible")}
    </span>
  );
}

export function CharacterOrganizationDesk({
  proposals,
  isLoading,
  onMergeTags,
  onApplyTag,
  onDismiss,
  dismissed,
  busy,
}: CharacterOrganizationDeskProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return <p className="px-1 py-3 text-xs text-[var(--muted-foreground)]">{t("characters.organize.loading")}</p>;
  }
  if (!proposals) return null;

  const duplicateTags = proposals.duplicateTags.filter((group) => !dismissed.has(`tag:${group.canonicalKey}`));
  const duplicateCharacters = proposals.duplicateCharacters.filter(
    (pair) => !dismissed.has(`pair:${pair.leftId}:${pair.rightId}`),
  );
  const tagSuggestions = proposals.tagSuggestions
    .map((entry) => ({
      ...entry,
      suggestions: entry.suggestions.filter(
        (suggestion) => !dismissed.has(`suggest:${entry.characterId}:${suggestion.tagKey}`),
      ),
    }))
    .filter((entry) => entry.suggestions.length > 0);

  const empty = duplicateTags.length === 0 && duplicateCharacters.length === 0 && tagSuggestions.length === 0;

  return (
    <div className="flex flex-col gap-4 py-2">
      <p className="flex items-start gap-1.5 px-1 text-[0.6875rem] leading-5 text-[var(--muted-foreground)]">
        <Info size="0.75rem" aria-hidden="true" className="mt-0.5 shrink-0" />
        {proposals.semanticAvailable
          ? t("characters.organize.explainer")
          : t("characters.organize.explainerNoEmbedder")}
      </p>

      {empty && <p className="px-1 text-xs text-[var(--muted-foreground)]">{t("characters.organize.empty")}</p>}

      {duplicateTags.length > 0 && (
        <section className="flex flex-col gap-1.5">
          <h3 className="px-1 text-xs font-medium">{t("characters.organize.duplicateTags")}</h3>
          {duplicateTags.map((group) => (
            <div key={group.canonicalKey} className="rounded-lg border border-[var(--border)] px-2.5 py-2 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <ConfidenceBadge confidence={group.confidence} />
                <span className="font-medium">{group.canonicalLabel}</span>
                <span className="text-[var(--muted-foreground)]">
                  {t("characters.organize.absorbsValue1", { value1: group.duplicateKeys.join(", ") })}
                </span>
              </div>
              <p className="mt-1 text-[0.625rem] text-[var(--muted-foreground)]">
                {group.reason === "same-letters"
                  ? t("characters.organize.reasonSameLetters")
                  : t("characters.organize.reasonPlural")}
              </p>
              <div className="mt-1.5 flex gap-1.5">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onMergeTags(group.canonicalLabel, group.duplicateKeys, group.characterCount)}
                  className="mari-chrome-control mari-chrome-control--compact mari-chrome-control--selected disabled:opacity-50"
                >
                  <Check size="0.625rem" aria-hidden="true" /> {t("characters.organize.merge")}
                </button>
                <button
                  type="button"
                  onClick={() => onDismiss(`tag:${group.canonicalKey}`)}
                  className="mari-chrome-control mari-chrome-control--compact"
                >
                  <X size="0.625rem" aria-hidden="true" /> {t("characters.organize.keepSeparate")}
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      {tagSuggestions.length > 0 && (
        <section className="flex flex-col gap-1.5">
          <h3 className="px-1 text-xs font-medium">{t("characters.organize.suggestedTags")}</h3>
          {tagSuggestions.map((entry) => (
            <div key={entry.characterId} className="rounded-lg border border-[var(--border)] px-2.5 py-2 text-xs">
              <span className="font-medium">{entry.characterName}</span>
              <ul className="mt-1 flex flex-col gap-1">
                {entry.suggestions.map((suggestion) => (
                  <li key={suggestion.tagKey} className="flex flex-wrap items-center gap-1.5">
                    <ConfidenceBadge confidence={suggestion.confidence} />
                    <span>{suggestion.tagLabel}</span>
                    {/* The evidence is the point: the user can see exactly why
                        this was proposed and reject it on sight. */}
                    <span className="text-[0.625rem] text-[var(--muted-foreground)]">
                      {t("characters.organize.becauseValue1", { value1: suggestion.evidence.join(", ") })}
                    </span>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onApplyTag(entry.characterId, suggestion.tagLabel)}
                      className="mari-chrome-control mari-chrome-control--compact ml-auto disabled:opacity-50"
                    >
                      <Check size="0.625rem" aria-hidden="true" /> {t("characters.organize.addTag")}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDismiss(`suggest:${entry.characterId}:${suggestion.tagKey}`)}
                      className="mari-chrome-control mari-chrome-control--compact"
                      aria-label={t("characters.organize.ignore")}
                    >
                      <X size="0.625rem" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {duplicateCharacters.length > 0 && (
        <section className="flex flex-col gap-1.5">
          <h3 className="px-1 text-xs font-medium">{t("characters.organize.similarCharacters")}</h3>
          {/* Reporting only. Two cards being alike is never grounds for
              deleting one, so there is no action here beyond dismissing. */}
          <p className="px-1 text-[0.625rem] text-[var(--muted-foreground)]">
            {t("characters.organize.similarCharactersNote")}
          </p>
          {duplicateCharacters.map((pair) => (
            <div
              key={`${pair.leftId}:${pair.rightId}`}
              className="flex flex-wrap items-center gap-1.5 rounded-lg border border-[var(--border)] px-2.5 py-2 text-xs"
            >
              <ConfidenceBadge confidence={pair.confidence} />
              <span>{pair.leftName}</span>
              <span className="text-[var(--muted-foreground)]">·</span>
              <span>{pair.rightName}</span>
              <button
                type="button"
                onClick={() => onDismiss(`pair:${pair.leftId}:${pair.rightId}`)}
                className="mari-chrome-control mari-chrome-control--compact ml-auto"
                aria-label={t("characters.organize.ignore")}
              >
                <X size="0.625rem" aria-hidden="true" />
              </button>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
