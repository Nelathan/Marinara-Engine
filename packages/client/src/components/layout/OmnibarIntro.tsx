import { useLayoutEffect, useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { INTRO_ICONS, MARI_BLINK_URL, MARI_PEEK_URL } from "./omnibar-empty-state-icons";

/**
 * Phase clock, in milliseconds from the first frame. The stage fades up first,
 * so nothing moves before the user's eye has landed. `globals.css` repeats these
 * numbers in its delays; change them together.
 */
const FADE_MS = 400;
const SHAKE_MS = 1400;
const FLY_STEP_MS = 300;
const FLY_MS = 1500;
const FIRST_FLY_MS = FADE_MS + SHAKE_MS;
const LAST_LANDING_MS = FIRST_FLY_MS + (INTRO_ICONS.length - 1) * FLY_STEP_MS + FLY_MS;

/** Full run time, including the pause on Mari's closing line. */
export const OMNIBAR_INTRO_DURATION_MS = 8600;

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
 * First-open walkthrough.
 *
 * The stage fades up, each top-bar icon names itself and rattles loose where it
 * already sits, then dives below the search field and swings back up into it.
 * The field steps wider with every icon it swallows. A caption explains each
 * phase, and Mari rises beside the field to say what the bar is actually for.
 *
 * She keeps standing there afterwards: the idle state re-renders her on the same
 * anchor, so the hand-off from intro to empty state has no gap.
 */
export function OmnibarIntro() {
  const { t } = useTranslation();
  const placements = useTopbarPlacements();

  const captions = [
    {
      text: t("omnibar.intro.step1", "Start here when you need to find something in Marinara."),
      in: FADE_MS,
      out: FIRST_FLY_MS + 200,
    },
    {
      text: t("omnibar.intro.step2", "Search across your chats, characters, lorebooks, presets, and more."),
      in: FIRST_FLY_MS + 400,
      out: LAST_LANDING_MS - 400,
    },
    {
      text: t(
        "omnibar.intro.step3",
        "Type what you need. Use a scope when you want more control, or ask Professor Mari.",
      ),
      in: LAST_LANDING_MS,
    },
  ];

  return (
    <div className="omnibar-intro pointer-events-none fixed inset-0 z-[105]" aria-hidden="true">
      {captions.map((caption, index) => (
        <p
          key={caption.text}
          className="omnibar-intro__caption"
          data-last={index === captions.length - 1 ? "true" : "false"}
          style={
            {
              "--omnibar-intro-caption-in": `${caption.in}ms`,
              "--omnibar-intro-caption-out": `${caption.out ?? 0}ms`,
            } as CSSProperties
          }
        >
          {caption.text}
        </p>
      ))}

      {placements.map(({ key, left, top, dx, dy }, index) => {
        const icon = INTRO_ICONS.find((item) => item.key === key)!;
        const vars = {
          left,
          top,
          "--omnibar-intro-dx": `${dx}px`,
          "--omnibar-intro-dy": `${dy}px`,
          "--omnibar-intro-shake-delay": `${FADE_MS + index * 40}ms`,
          "--omnibar-intro-fly-delay": `${FIRST_FLY_MS + index * FLY_STEP_MS}ms`,
          "--omnibar-intro-land-delay": `${FIRST_FLY_MS + index * FLY_STEP_MS + FLY_MS - 100}ms`,
        } as CSSProperties;
        return (
          <span key={key}>
            <span className="omnibar-intro__icon" style={vars}>
              <icon.icon size={19} strokeWidth={1.8} />
            </span>
            <span className="omnibar-intro__label" style={vars}>
              {t(icon.labelKey, icon.key)}
            </span>
            <span className="omnibar-intro__pulse" style={vars} />
          </span>
        );
      })}

      <span className="omnibar-mari-anchor omnibar-intro__mari">
        <img src={MARI_PEEK_URL} alt="" draggable={false} data-part="idle" />
        <img src={MARI_BLINK_URL} alt="" draggable={false} data-part="blink" />
      </span>
      <p className="omnibar-mari-bubble omnibar-intro__bubble">
        {t("omnibar.intro.line", "Search first. When you need help or want to take action, ask Professor Mari here.")}
      </p>
    </div>
  );
}
