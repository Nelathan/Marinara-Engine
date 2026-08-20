import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowRight, Loader2, RotateCcw, Sparkles, Square } from "lucide-react";
import { useTranslation } from "react-i18next";
import type {
  ProfessorMariAskContext,
  ProfessorMariQuickMetadata,
  ProfessorMariQuickPromptRequest,
} from "@marinara-engine/shared";
import { api } from "../../../lib/api-client";
import type { CommandCenterQuickTask } from "../../../lib/command-center";

export function OmnibarQuickMariPane({
  task,
  connectionId,
  context,
  debugMode,
  onTaskChange,
  onPromote,
}: {
  task: CommandCenterQuickTask;
  connectionId: string | null;
  context: ProfessorMariAskContext | null;
  debugMode: boolean;
  onTaskChange: (task: CommandCenterQuickTask) => void;
  onPromote: () => void;
}) {
  const { t } = useTranslation();
  const abortRef = useRef<AbortController | null>(null);
  const startedTaskRef = useRef<string | null>(null);
  const taskRef = useRef(task);
  const onTaskChangeRef = useRef(onTaskChange);
  taskRef.current = task;
  onTaskChangeRef.current = onTaskChange;
  const [attempt, setAttempt] = useState(0);
  const [metadata, setMetadata] = useState<ProfessorMariQuickMetadata | null>(null);

  useEffect(() => {
    if (task.status !== "streaming" || startedTaskRef.current?.startsWith(`${task.id}:`)) return;
    onTaskChange({
      ...task,
      status: "error",
      answer: t("commandCenter.quick.interrupted", "The previous Quick request was interrupted."),
    });
  }, [onTaskChange, t, task]);

  useEffect(() => {
    const initialTask = taskRef.current;
    if (initialTask.status !== "ready" || startedTaskRef.current === `${initialTask.id}:${attempt}`) return;
    startedTaskRef.current = `${initialTask.id}:${attempt}`;
    const controller = new AbortController();
    abortRef.current = controller;
    let answer = "";
    onTaskChangeRef.current({ ...initialTask, status: "streaming", answer: "" });
    const body: ProfessorMariQuickPromptRequest = {
      message: initialTask.message,
      connectionId,
      context: context
        ? {
            source: context.source,
            capability: context.capability,
            query: context.query,
            resource: context.resource,
            field: context.field,
            fieldId: context.fieldId,
            action: context.action,
          }
        : undefined,
      debugMode,
    };

    void (async () => {
      try {
        for await (const event of api.streamEvents("/professor-mari/quick/prompt", body, controller.signal)) {
          if (event.type === "token" && typeof event.data === "string") {
            answer += event.data;
            onTaskChangeRef.current({ ...initialTask, status: "streaming", answer });
          } else if (event.type === "metadata" && event.data && typeof event.data === "object") {
            setMetadata(event.data as ProfessorMariQuickMetadata);
          } else if (event.type === "complete") {
            onTaskChangeRef.current({ ...initialTask, status: "complete", answer });
          } else if (event.type === "error") {
            throw new Error(typeof event.data === "string" ? event.data : "Quick Mari failed");
          }
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        onTaskChangeRef.current({
          ...initialTask,
          status: "error",
          answer: error instanceof Error ? error.message : String(error),
        });
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
      }
    })();

    return () => controller.abort();
  }, [attempt, connectionId, context, debugMode, task.id]);

  const retry = () => {
    startedTaskRef.current = null;
    setMetadata(null);
    onTaskChange({ ...task, status: "ready", answer: "" });
    setAttempt((current) => current + 1);
  };

  return (
    <section className="mari-workspace-canvas flex min-h-0 flex-1 flex-col" aria-live="polite">
      <div className="flex items-center gap-2 border-b border-[var(--border)]/50 px-3 py-2">
        <Sparkles size="0.85rem" className="text-[var(--primary)]" />
        <span className="text-xs font-semibold text-[var(--foreground)]">
          {t("commandCenter.quick.costLabel", "Quick · 1 model call")}
        </span>
        {metadata?.fallbackUsed ? (
          <span className="ml-auto text-[0.625rem] text-amber-300">
            {t("commandCenter.quick.fallback", "Using {{connection}}", { connection: metadata.connectionName })}
          </span>
        ) : metadata ? (
          <span className="ml-auto truncate text-[0.625rem] text-[var(--muted-foreground)]">
            {metadata.connectionName} · {metadata.model}
          </span>
        ) : null}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-2xl">
          <p className="text-xs font-medium text-[var(--muted-foreground)]">{task.message}</p>
          <div className="mt-4 flex items-start gap-3">
            <span
              className="mari-workspace-portrait size-8"
              data-state={task.status === "error" ? "warning" : "explaining"}
            >
              <img src="/sprites/mari/generated/professor-mari-assistant-idle.png" alt="" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1 whitespace-pre-wrap text-sm leading-relaxed text-[var(--foreground)]">
              {task.status === "error" ? (
                <span className="text-[var(--destructive)]">{task.answer}</span>
              ) : task.answer || task.status === "streaming" ? (
                task.answer || t("commandCenter.quick.thinking", "Thinking…")
              ) : (
                <span className="text-[var(--muted-foreground)]">{t("commandCenter.quick.starting", "Starting…")}</span>
              )}
              {task.status === "streaming" ? (
                <span className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-[var(--primary)]" />
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-[var(--border)]/50 px-3 py-2.5">
        {task.status === "streaming" ? (
          <button
            type="button"
            onClick={() => {
              abortRef.current?.abort();
              onTaskChange({ ...task, status: "error", answer: t("commandCenter.quick.cancelled", "Cancelled") });
            }}
            className="mari-chrome-control mari-chrome-control--small"
          >
            <Square size="0.75rem" />
            {t("common.cancel", "Cancel")}
          </button>
        ) : task.status === "error" ? (
          <button type="button" onClick={retry} className="mari-chrome-control mari-chrome-control--small">
            <RotateCcw size="0.75rem" />
            {t("common.retry", "Retry")}
          </button>
        ) : null}
        {task.status === "complete" ? (
          <button
            type="button"
            onClick={onPromote}
            className="mari-chrome-control mari-chrome-control--primary mari-chrome-control--small ml-auto"
          >
            {t("commandCenter.quick.continue", "Continue in Full Mari")}
            <ArrowRight size="0.75rem" />
          </button>
        ) : null}
        {task.status === "error" ? <AlertTriangle size="0.8rem" className="ml-auto text-[var(--destructive)]" /> : null}
        {task.status === "streaming" ? (
          <Loader2 size="0.8rem" className="ml-auto animate-spin text-[var(--primary)]" />
        ) : null}
      </div>
    </section>
  );
}
