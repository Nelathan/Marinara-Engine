import { useTranslation } from "react-i18next";
import { INTRO_ICONS, MARI_PEEK_URL } from "./omnibar-empty-state-icons";

/**
 * First-open showpiece: the top-bar icons whirl around the screen, get eaten by
 * the search field one at a time, and Mari pops out to hand the bar over. The
 * whole sequence is CSS (see `globals.css`); this only places the pieces and
 * hands each one its angle and stagger.
 *
 * Total run time is `OMNIBAR_INTRO_DURATION_MS`. Typing or Escape cuts it short.
 */
export const OMNIBAR_INTRO_DURATION_MS = 6200;

export function OmnibarIntro() {
  const { t } = useTranslation();
  const step = 360 / INTRO_ICONS.length;

  return (
    <div className="omnibar-intro pointer-events-none fixed inset-0 z-[105]" aria-hidden="true">
      {INTRO_ICONS.map(({ icon: Icon, key }, index) => {
        const vars = {
          "--omnibar-intro-a": index * step,
          "--omnibar-intro-delay": `${index * 150}ms`,
        } as React.CSSProperties;
        return (
          <span key={key}>
            <span className="omnibar-intro__icon" style={vars}>
              <Icon size={19} strokeWidth={1.8} />
            </span>
            <span className="omnibar-intro__pulse" style={vars} />
          </span>
        );
      })}
      <span className="omnibar-intro__mari">
        <img src={MARI_PEEK_URL} alt="" draggable={false} />
      </span>
      <p className="omnibar-intro__bubble">
        {t("omnibar.intro.line", "Everything in Marinara now lives in this one bar. Ask me for any of it.")}
      </p>
    </div>
  );
}
