/**
 * How long one work-card step took, in whole seconds, or null when we cannot say.
 *
 * A finished step uses `durationMs`, measured on the SERVER. That is the only figure that
 * survives a reload and it never compares two clocks. A running step is timed from the local
 * sighting instead, which needs no comparison either. `updatedAt - startedAt` is the last
 * resort for an older server that sends no duration.
 */
export function resolveStepSeconds(step: {
  running: boolean;
  startedAt: number;
  durationMs?: number;
  updatedAt: number;
  now: number;
}): number | null {
  const ms = step.running
    ? step.startedAt
      ? step.now - step.startedAt
      : null
    : (step.durationMs ?? (step.startedAt ? step.updatedAt - step.startedAt : null));
  if (ms === null) return null;
  return Math.max(1, Math.round(ms / 1000));
}
