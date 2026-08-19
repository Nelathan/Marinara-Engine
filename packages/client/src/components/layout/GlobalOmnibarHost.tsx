import { Suspense, lazy, useEffect } from "react";
import { useUIStore } from "../../stores/ui.store";

// The dialog carries the whole Command Center (search, browse, Mari panes), so it
// stays out of the eager app shell chunk until the user actually opens it.
const GlobalOmnibarDialog = lazy(() =>
  import("./GlobalOmnibar").then((module) => ({ default: module.GlobalOmnibarDialog })),
);

export function GlobalOmnibar() {
  const open = useUIStore((state) => state.omnibarOpen);
  const setOpen = useUIStore((state) => state.setOmnibarOpen);

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(!useUIStore.getState().omnibarOpen);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setOpen]);

  return open ? (
    <Suspense fallback={null}>
      <GlobalOmnibarDialog onClose={() => setOpen(false)} />
    </Suspense>
  ) : null;
}
