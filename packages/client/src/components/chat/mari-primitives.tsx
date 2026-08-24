import type { ReactNode } from "react";

import { cn } from "../../lib/utils";

/**
 * Small layout primitives shared by Professor Mari's workspace. Turns use
 * `TranscriptRow`, controls use `.mari-chrome-control`, and resource identity
 * comes from `ResourceIdentityHeader`.
 *
 * See `docs/development/omnibar-concept.md` R41-R48.
 */

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
 * A grouped row of controls. It wraps when space is available; dense grouped
 * strips may opt into two horizontal lanes on phones with `--stacked`.
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
