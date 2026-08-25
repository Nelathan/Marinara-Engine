import { useLayoutEffect, useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { INTRO_ICONS, MARI_BLINK_URL, MARI_PEEK_URL } from "./omnibar-empty-state-icons";

/** Full run time of the sequence below, in milliseconds. */
export const OMNIBAR_INTRO_DURATION_MS = 7600;

type Placement = { key: string; left: number; top: number; dx: number; dy: number };

/**
 * Measure where each top-bar button actually sits, and how far it is from the
 * middle of the search field. Hard-coded coordinates would be wrong at every
 * breakpoint, so the flight path is built from the live layout instead.
 */
function useTopbarPlacements() {
  const [placements, setPlacements] = useState<Placement[]>([]);

  useLayoutEffect(() => {
    const panel = document.querySelector('[data-component="GlobalOmnibar.Panel"]');
    if (!panel) return;
    const bar = panel.getBoundingClientRect();
    // The search field is the panel's first row; its centre is the target.
    const targetX = bar.left + bar.width / 2;
    const targetY = bar.top + 28;
    const measured: Placement[] = [];
    for (const { key, topbarKey } of INTRO_ICONS) {
      const button = document.querySelector(`[data-topbar-hover-key="${topbarKey}"]`);
      if (!button) continue;
      const from = button.getBoundingClientRect();
      const left = from.left + from.width / 2;
      const top = from.top + from.height / 2;
      measured.push({ key, left, top, dx: targetX - left, dy: targetY - top });
    }
    setPlacements(measured);
  }, []);

  return placements;
}

/**
 * First-open showpiece.
 *
 * Every top-bar icon rattles loose where it already lives, dives below the
 * search field, and swings back up into it on a long bow. The field flashes and
 * steps wider with each one it swallows. Mari rises beside it at the halfway
 * mark and hands the finished bar over.
 *
 * The motion is all CSS (see `globals.css`); this only measures the start and
 * end points and hands each icon its stagger.
 */
export function OmnibarIntro() {
  const { t } = useTranslation();
  const placements = useTopbarPlacements();

  return (
    <div className="omnibar-intro pointer-events-none fixed inset-0 z-[105]" aria-hidden="true">
      {placements.map(({ key, left, top, dx, dy }, index) => {
        const icon = INTRO_ICONS.find((item) => item.key === key)!;
        const vars = {
          left,
          top,
          "--omnibar-intro-dx": `${dx}px`,
          "--omnibar-intro-dy": `${dy}px`,
          "--omnibar-intro-shake-delay": `${index * 40}ms`,
          "--omnibar-intro-fly-delay": `${1200 + index * 300}ms`,
          "--omnibar-intro-land-delay": `${2600 + index * 300}ms`,
        } as CSSProperties;
        return (
          <span key={key}>
            <span className="omnibar-intro__icon" style={vars}>
              <icon.icon size={19} strokeWidth={1.8} />
            </span>
            <span className="omnibar-intro__pulse" style={vars} />
          </span>
        );
      })}

      <span className="omnibar-intro__mari">
        <img src={MARI_PEEK_URL} alt="" draggable={false} data-part="idle" />
        <img src={MARI_BLINK_URL} alt="" draggable={false} data-part="blink" />
      </span>
      <p className="omnibar-intro__bubble">
        {t("omnibar.intro.line", "Everything in Marinara now lives in this one bar. Ask me for any of it.")}
      </p>
    </div>
  );
}
