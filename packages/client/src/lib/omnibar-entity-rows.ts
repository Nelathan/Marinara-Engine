/**
 * Row builders for the omnibar's searchable entity data. One function per
 * category, each pure given its raw rows, the lookup maps it needs, the label
 * bag and a translate function — no hooks, no store access, no mutations.
 *
 * `preview` stays a thunk: preview data is only built for the focused row, so
 * building it here for every entity would undo that.
 */
import type { Chat, Lorebook, Persona, PromptPreset } from "@marinara-engine/shared";
import type { AgentConfigRow } from "../hooks/use-agents";
import type {
  CommandCenterCategoryLabels,
  CommandCenterChatModeLabels,
} from "../components/command-center/command-center-visuals";
import { formatDate, readNamedRow, readString } from "./omnibar-row-readers";
import { parseCharacterDisplayData } from "./character-display";
import { resolvePresetArtwork } from "./preset-artwork";
import { getAvatarCropStyle } from "./utils";

/** The `t` shape these builders need, without the i18next generic machinery. */
export type OmnibarTranslate = (key: string, fallback: string, options?: Record<string, unknown>) => string;

/** Minimal `{ id, name }` view of a connection row. */
export type OmnibarNamedRow = { id: string; name: string };

export type OmnibarChatRowsInput = {
  chats: readonly Chat[];
  characterById: ReadonlyMap<string, unknown>;
  connectionById: ReadonlyMap<string, OmnibarNamedRow>;
  personaById: ReadonlyMap<string, Persona>;
  chatModeLabels: CommandCenterChatModeLabels;
  t: OmnibarTranslate;
};

export function buildOmnibarChatRows({
  chats,
  characterById,
  connectionById,
  personaById,
  chatModeLabels,
  t,
}: OmnibarChatRowsInput) {
  return chats.map((chat) => {
    const linkedCharacters = (chat.characterIds ?? []).slice(0, 2).flatMap((id) => {
      const linked = characterById.get(id) as Record<string, unknown> | undefined;
      if (!linked) return [];
      const display = parseCharacterDisplayData({
        data: linked.data,
        comment: linked.comment as string | null | undefined,
      });
      return [{ display, avatarPath: readString(linked.avatarPath) }];
    });
    const linkedDisplay = linkedCharacters[0]?.display;
    const connection = chat.connectionId ? connectionById.get(chat.connectionId) : undefined;
    const persona = chat.personaId ? personaById.get(chat.personaId) : undefined;
    const updated = formatDate(chat.lastMessageAt ?? chat.updatedAt);
    return {
      id: chat.id,
      name: chat.name,
      mode: chat.mode,
      preview: () => ({
        kind: "chat" as const,
        title: chat.name,
        categoryLabel: chatModeLabels[chat.mode],
        subtitle: linkedCharacters.map((item) => item.display.name).join(", ") || undefined,
        media: linkedCharacters[0]?.avatarPath
          ? {
              src: linkedCharacters[0].avatarPath,
              alt: linkedDisplay?.name ?? chat.name,
              kind: "avatar" as const,
              avatarCropStyle: getAvatarCropStyle(linkedDisplay?.avatarCrop),
            }
          : undefined,
        facts: [
          {
            label: t("commandCenter.preview.lastUpdated", "Last updated"),
            value: updated ?? t("commandCenter.values.unknown", "Unknown"),
          },
          ...(connection
            ? [{ label: t("commandCenter.preview.connection", "Connection"), value: connection.name }]
            : []),
          ...(persona ? [{ label: t("commandCenter.preview.persona", "Persona"), value: persona.name }] : []),
          ...(chat.metadata?.tags?.length
            ? [{ label: t("commandCenter.preview.tags", "Tags"), value: chat.metadata.tags.join(", ") }]
            : []),
          ...(chat.metadata?.enableAgents !== undefined
            ? [
                {
                  label: t("commandCenter.preview.agents", "Agents"),
                  value: chat.metadata.enableAgents
                    ? t("commandCenter.values.enabled", "Enabled")
                    : t("commandCenter.values.disabled", "Disabled"),
                },
              ]
            : []),
        ],
      }),
    };
  });
}

export type OmnibarCharacterRowsInput = {
  characters: readonly unknown[];
  lorebookNamesByCharacter: ReadonlyMap<string, string[]>;
  categoryLabels: CommandCenterCategoryLabels;
  t: OmnibarTranslate;
};

export function buildOmnibarCharacterRows({
  characters,
  lorebookNamesByCharacter,
  categoryLabels,
  t,
}: OmnibarCharacterRowsInput) {
  return characters.flatMap((item) => {
    const row = readNamedRow(item);
    if (!row) return [];
    const record = item as Record<string, unknown>;
    const display = parseCharacterDisplayData({
      data: record.data,
      comment: record.comment as string | null | undefined,
    });
    const avatarPath = typeof record.avatarPath === "string" ? record.avatarPath : undefined;
    return [
      {
        kind: "character" as const,
        ...row,
        name: display.name,
        description: display.description ?? undefined,
        preview: () => ({
          kind: "character" as const,
          title: display.name,
          description: display.description ?? undefined,
          categoryLabel: categoryLabels.character,
          media: avatarPath
            ? {
                src: avatarPath,
                alt: display.name,
                kind: "avatar" as const,
                avatarCropStyle: getAvatarCropStyle(display.avatarCrop),
              }
            : undefined,
          metadataLine:
            [
              display.creator
                ? t("commandCenter.preview.byCreator", "by {{creator}}", { creator: display.creator })
                : null,
              readString(record.version)
                ? t("commandCenter.preview.versionShort", "v{{version}}", { version: readString(record.version)! })
                : null,
            ]
              .filter(Boolean)
              .join(" · ") || undefined,
          facts: [
            ...(display.creator
              ? [{ label: t("commandCenter.preview.creator", "Creator"), value: display.creator }]
              : []),
            ...(readString(record.version)
              ? [{ label: t("commandCenter.preview.version", "Version"), value: readString(record.version)! }]
              : []),
            ...(lorebookNamesByCharacter.get(row.id)?.length
              ? [
                  {
                    label: t("commandCenter.preview.lorebooks", "Lorebooks"),
                    value: lorebookNamesByCharacter.get(row.id)!.join(", "),
                  },
                ]
              : []),
            ...(display.comment
              ? [{ label: t("commandCenter.preview.comment", "Comment"), value: display.comment }]
              : []),
          ],
          badges: (display.tags ?? []).length
            ? [t("commandCenter.preview.tagsValue", "Tags: {{tags}}", { tags: (display.tags ?? []).join(", ") })]
            : [],
        }),
      },
    ];
  });
}

export type OmnibarPersonaRowsInput = {
  personas: readonly Persona[];
  lorebookNamesByPersona: ReadonlyMap<string, string[]>;
  categoryLabels: CommandCenterCategoryLabels;
  t: OmnibarTranslate;
  /** Called when the row's toggle activates a persona. */
  onActivatePersona: (id: string) => void;
};

export function buildOmnibarPersonaRows({
  personas,
  lorebookNamesByPersona,
  categoryLabels,
  t,
  onActivatePersona,
}: OmnibarPersonaRowsInput) {
  return personas.map((item) => ({
    kind: "persona" as const,
    id: item.id,
    name: item.name,
    description: item.description,
    preview: () => ({
      kind: "persona" as const,
      title: item.name,
      description: item.description,
      categoryLabel: categoryLabels.persona,
      media: item.avatarPath
        ? {
            src: item.avatarPath,
            alt: item.name,
            kind: "avatar" as const,
            avatarCropStyle: getAvatarCropStyle(item.avatarCrop),
          }
        : undefined,
      facts: [
        ...(item.creator ? [{ label: t("commandCenter.preview.creator", "Creator"), value: item.creator }] : []),
        ...(item.personaVersion
          ? [{ label: t("commandCenter.preview.version", "Version"), value: item.personaVersion }]
          : []),
        ...(lorebookNamesByPersona.get(item.id)?.length
          ? [
              {
                label: t("commandCenter.preview.lorebooks", "Lorebooks"),
                value: lorebookNamesByPersona.get(item.id)!.join(", "),
              },
            ]
          : []),
        ...(item.comment ? [{ label: t("commandCenter.preview.note", "Note"), value: item.comment }] : []),
      ],
      badges: [
        ...(item.tags?.length
          ? [t("commandCenter.preview.tagsValue", "Tags: {{tags}}", { tags: item.tags.join(", ") })]
          : []),
        ...(item.isActive ? [t("commandCenter.values.active", "Active")] : []),
      ],
      accent: item.nameColor,
    }),
    control: {
      type: "toggle" as const,
      label: item.isActive
        ? t("commandCenter.actions.activePersona", "Active persona")
        : t("commandCenter.actions.activatePersona", "Activate persona"),
      value: item.isActive,
      onChange: (value: string | boolean) => value === true && !item.isActive && onActivatePersona(item.id),
    },
  }));
}

export type OmnibarLorebookRowsInput = {
  lorebooks: readonly Lorebook[];
  characterNameById: ReadonlyMap<string, string>;
  personaById: ReadonlyMap<string, Persona>;
  categoryLabels: CommandCenterCategoryLabels;
  t: OmnibarTranslate;
  /** Called when the row's toggle enables or disables a lorebook. */
  onSetLorebookEnabled: (id: string, enabled: boolean) => void;
};

export function buildOmnibarLorebookRows({
  lorebooks,
  characterNameById,
  personaById,
  categoryLabels,
  t,
  onSetLorebookEnabled,
}: OmnibarLorebookRowsInput) {
  return lorebooks.map((item) => {
    const linkedNames = [
      ...(item.characterIds ?? []).map((id) => characterNameById.get(id)),
      ...(item.personaIds ?? []).map((id) => personaById.get(id)?.name),
    ].filter((name): name is string => Boolean(name));
    return {
      kind: "lorebook" as const,
      id: item.id,
      name: item.name,
      description: item.description,
      preview: () => ({
        kind: "lorebook" as const,
        title: item.name,
        description: item.description,
        categoryLabel: categoryLabels.lorebook,
        media: item.imagePath ? { src: item.imagePath, alt: item.name, kind: "artwork" as const } : undefined,
        metadataLine:
          [
            typeof item.entryCount === "number"
              ? t("commandCenter.preview.entryCount", "{{count}} entries", { count: item.entryCount })
              : null,
            item.isGlobal ? t("commandCenter.values.global", "Global") : t("commandCenter.values.scoped", "Scoped"),
            linkedNames.length
              ? t("commandCenter.preview.linkedCount", "{{count}} linked", { count: linkedNames.length })
              : null,
          ]
            .filter(Boolean)
            .join(" · ") || undefined,
        status: {
          label: item.enabled
            ? t("commandCenter.values.enabled", "Enabled")
            : t("commandCenter.values.disabled", "Disabled"),
          tone: item.enabled ? ("success" as const) : ("neutral" as const),
        },
        facts: [
          { label: t("commandCenter.preview.category", "Category"), value: item.category },
          { label: t("commandCenter.preview.tokenBudget", "Token budget"), value: item.tokenBudget },
          { label: t("commandCenter.preview.entryLimit", "Entry limit"), value: item.entryLimit },
          {
            label: t("commandCenter.preview.scope", "Scope"),
            value: item.isGlobal
              ? t("commandCenter.values.global", "Global")
              : t("commandCenter.values.scoped", "Scoped"),
          },
          ...(linkedNames.length
            ? [{ label: t("commandCenter.preview.linkedTo", "Linked to"), value: linkedNames.join(", ") }]
            : []),
        ],
        badges: item.tags?.length
          ? [t("commandCenter.preview.tagsValue", "Tags: {{tags}}", { tags: item.tags.join(", ") })]
          : [],
      }),
      control: {
        type: "toggle" as const,
        label: item.enabled
          ? t("commandCenter.actions.disableLorebook", "Disable lorebook")
          : t("commandCenter.actions.enableLorebook", "Enable lorebook"),
        value: item.enabled,
        onChange: (value: string | boolean) => onSetLorebookEnabled(item.id, value === true),
      },
    };
  });
}

export type OmnibarPresetRowsInput = {
  presets: readonly PromptPreset[];
  categoryLabels: CommandCenterCategoryLabels;
  t: OmnibarTranslate;
  /** Called when the row's toggle makes a preset the default. */
  onSetDefaultPreset: (id: string) => void;
};

export function buildOmnibarPresetRows({ presets, categoryLabels, t, onSetDefaultPreset }: OmnibarPresetRowsInput) {
  return presets.map((item) => {
    const artwork = resolvePresetArtwork(item);
    return {
      kind: "preset" as const,
      id: item.id,
      name: item.name,
      description: item.description,
      preview: () => ({
        kind: "preset" as const,
        title: item.name,
        description: item.description,
        categoryLabel: categoryLabels.preset,
        media: artwork ? { src: artwork, alt: item.name, kind: "artwork" as const } : undefined,
        status: item.isDefault
          ? { label: t("commandCenter.values.default", "Default"), tone: "success" as const }
          : undefined,
        facts: [
          { label: t("commandCenter.preview.author", "Author"), value: item.author },
          { label: t("commandCenter.preview.wrapFormat", "Wrap format"), value: item.wrapFormat },
          { label: t("commandCenter.preview.sections", "Sections"), value: item.sectionOrder.length },
          { label: t("commandCenter.preview.groups", "Groups"), value: item.groupOrder.length },
        ],
      }),
      control: {
        type: "toggle" as const,
        label: item.isDefault
          ? t("commandCenter.actions.defaultPreset", "Default preset")
          : t("commandCenter.actions.setDefaultPreset", "Set default preset"),
        value: item.isDefault,
        onChange: (value: string | boolean) => value === true && !item.isDefault && onSetDefaultPreset(item.id),
      },
    };
  });
}

export type OmnibarAgentRowsInput = {
  agents: readonly AgentConfigRow[];
  connectionById: ReadonlyMap<string, OmnibarNamedRow>;
  categoryLabels: CommandCenterCategoryLabels;
  t: OmnibarTranslate;
};

export function buildOmnibarAgentRows({ agents, connectionById, categoryLabels, t }: OmnibarAgentRowsInput) {
  return agents.map((item) => ({
    kind: "agent" as const,
    id: item.type,
    name: item.name,
    aliases: [item.type],
    description: item.description,
    preview: () => ({
      kind: "agent" as const,
      title: item.name,
      description: item.description,
      categoryLabel: categoryLabels.agent,
      media: item.imagePath ? { src: item.imagePath, alt: item.name, kind: "artwork" as const } : undefined,
      status: {
        label:
          item.enabled === "true"
            ? t("commandCenter.values.enabled", "Enabled")
            : t("commandCenter.values.disabled", "Disabled"),
        tone: item.enabled === "true" ? ("success" as const) : ("neutral" as const),
      },
      facts: [
        { label: t("commandCenter.preview.phase", "Phase"), value: item.phase },
        { label: t("commandCenter.preview.type", "Type"), value: item.type },
        ...(item.connectionId
          ? [
              {
                label: t("commandCenter.preview.connection", "Connection"),
                value: connectionById.get(item.connectionId)?.name ?? item.connectionId,
              },
            ]
          : []),
      ],
    }),
  }));
}

export type OmnibarConnectionRowsInput = {
  connections: readonly unknown[];
  categoryLabels: CommandCenterCategoryLabels;
  t: OmnibarTranslate;
};

export function buildOmnibarConnectionRows({ connections, categoryLabels, t }: OmnibarConnectionRowsInput) {
  return connections.flatMap((item) => {
    const row = readNamedRow(item);
    if (!row) return [];
    const record = item as Record<string, unknown>;
    const provider = typeof record.provider === "string" ? record.provider : undefined;
    const model = typeof record.model === "string" ? record.model : undefined;
    const imagePath = typeof record.imagePath === "string" ? record.imagePath : undefined;
    return [
      {
        ...row,
        provider,
        model,
        isDefault: record.isDefault === true,
        imagePath,
        preview: () => ({
          kind: "connection" as const,
          title: row.name,
          categoryLabel: categoryLabels.connection,
          subtitle: provider,
          media: imagePath ? { src: imagePath, alt: row.name, kind: "artwork" as const } : undefined,
          status:
            record.isDefault === true
              ? {
                  label: t("commandCenter.preview.defaultConnection", "Default connection"),
                  tone: "success" as const,
                }
              : undefined,
          facts: [
            ...(model ? [{ label: t("commandCenter.preview.model", "Model"), value: model }] : []),
            ...(provider ? [{ label: t("commandCenter.preview.provider", "Provider"), value: provider }] : []),
            ...(readString(record.context)
              ? [{ label: t("commandCenter.preview.context", "Context"), value: readString(record.context)! }]
              : []),
            ...(readString(record.maxContext)
              ? [
                  {
                    label: t("commandCenter.preview.maxContext", "Max context"),
                    value: readString(record.maxContext)!,
                  },
                ]
              : []),
          ],
        }),
      },
    ];
  });
}
