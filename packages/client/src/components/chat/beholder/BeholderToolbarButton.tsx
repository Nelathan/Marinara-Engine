import { lazy, Suspense, useState } from "react";
import { Eye } from "lucide-react";
import { useTranslation as useUiTranslation } from "react-i18next";
import { ChatToolbarButton } from "../ChatToolbarControls";

const BeholderDock = lazy(() => import("./BeholderDock"));

/**
 * Opens the physical-state dock from the chat toolbar, beside the other panel controls,
 * which is where the reference extractor puts it in this host.
 *
 * Rendered only when Beholder is actually tracking this chat: the state it shows is
 * produced by the agent, so without it the button would open an empty panel and take a
 * toolbar slot from everyone who does not use it.
 */
export default function BeholderToolbarButton({ chatId, active }: { chatId: string; active: boolean }) {
  const { t: localizeUi } = useUiTranslation();
  const [open, setOpen] = useState(false);
  if (!active) return null;
  return (
    <>
      <ChatToolbarButton
        icon={<Eye size="0.875rem" />}
        title={localizeUi("ui.chat.beholder.dockTitle")}
        onClick={() => setOpen((current) => !current)}
      />
      {open ? (
        <Suspense fallback={null}>
          <BeholderDock chatId={chatId} open={open} onClose={() => setOpen(false)} />
        </Suspense>
      ) : null}
    </>
  );
}
