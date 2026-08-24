import type { ReactNode } from "react";

import { cn } from "../../lib/utils";

/**
 * Professor Mari's window is built from five primitives, so that twenty-two
 * separately-designed elements read as one product. Two already existed and are
 * reused rather than rebuilt: the Turn is `TranscriptRow`, and the Chip is the
 * `.mari-chrome-control` class. The three here are the rest.
 *
 * See `docs/development/omnibar-concept.md` R41-R48.
 */

/**
 * R42: a border, meaning exactly one thing - your data is involved. Approvals,
 * action results, diffs and artifacts. Nothing else may carry one, and there is
 * deliberately no second, quieter weight: a decorative border would dilute the
 * only signal this one carries.
 */
export function MariCard({
  children,
  className,
  ...rest
}: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mari-card", className)} {...rest}>
      {children}
    </div>
  );
}

/** R43: one muted line. Colour is its only variation. */
export function MariNote({
  tone = "muted",
  children,
  className,
  ...rest
}: {
  tone?: "muted" | "accent" | "danger";
  children: ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("mari-note", className)} data-tone={tone} {...rest}>
      {children}
    </p>
  );
}

/**
 * R45: one wrapping row of Chips. It never scrolls horizontally - a scroller
 * hides facts, and on a phone the status facts have to stay visible. Desktop
 * fits one line, a narrow viewport wraps, and no media query is involved.
 */
export function MariStrip({
  children,
  className,
  ...rest
}: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mari-strip", className)} {...rest}>
      {children}
    </div>
  );
}
