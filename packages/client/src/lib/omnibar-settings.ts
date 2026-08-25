import type { ProfessorMariNavigationTarget } from "./professor-mari-navigation";

type SettingsTab = Extract<ProfessorMariNavigationTarget, { kind: "settings" }>["tab"];

export type OmnibarSettingsDestination = {
  id: string;
  title: { key: string; fallback: string };
  description: { key: string; fallback: string };
  aliases: readonly { key: string; fallback: string }[];
  tab: SettingsTab;
  section: string;
  sectionLabel: { key: string; fallback: string };
  controlId?: string;
};

const sections = [
  [
    "general",
    "App Behavior",
    "Language, responses, input, notifications, and playback.",
    "enable-streaming",
    ["general", "application", "notifications", "responses", "input", "editing"],
  ],
  [
    "appearance",
    "Appearance",
    "Theme, chat display, art, motion, and backgrounds.",
    "theme-mode",
    ["appearance", "style", "display", "font", "background"],
  ],
  [
    "generations",
    "Generations",
    "Image, video, asset, and prompt defaults.",
    "queue-media-generation",
    ["generation", "image", "video", "assets", "prompts"],
  ],
  [
    "addons",
    "Addons",
    "Personal extensions and custom themes.",
    "personal-extensions",
    ["addons", "extensions", "custom css", "themes"],
  ],
  [
    "import",
    "Imports",
    "Profiles, assets, and data transfer.",
    "profile-marinara",
    ["import", "restore", "profile", "transfer"],
  ],
  [
    "advanced",
    "Advanced",
    "Updates, diagnostics, backups, and tools.",
    "release-channel",
    ["advanced", "admin", "debug", "backup", "diagnostics", "storage"],
  ],
] as const satisfies readonly [SettingsTab, string, string, string, readonly string[]][];

const controls = [
  [
    "enable-streaming",
    "Enable streaming",
    "Responses",
    "Show AI responses as they generate.",
    "general",
    ["stream", "typewriter", "response"],
  ],
  [
    "streaming-speed",
    "Streaming speed",
    "Responses",
    "Tune how fast streamed tokens appear.",
    "general",
    ["stream", "speed", "typewriter"],
  ],
  [
    "send-on-enter",
    "Send on Enter",
    "Input & Editing",
    "Choose which chat surfaces send on Enter.",
    "general",
    ["enter", "send", "keyboard"],
  ],
  [
    "speech-to-text",
    "Speech-to-text microphone",
    "Input & Editing",
    "Show a microphone button in chat inputs.",
    "general",
    ["microphone", "dictation", "speech"],
  ],
  [
    "show-message-timestamps",
    "Show message timestamps",
    "Message Tools",
    "Display date and time on chat messages.",
    "advanced",
    ["time", "date", "metadata"],
  ],
  [
    "show-model-name",
    "Show model name on messages",
    "Message Tools",
    "Display which AI model generated each response.",
    "advanced",
    ["model", "metadata"],
  ],
  [
    "show-token-usage",
    "Show token usage on messages",
    "Message Tools",
    "Display prompt and completion token counts.",
    "advanced",
    ["tokens", "context", "cost"],
  ],
  [
    "theme-mode",
    "Color scheme",
    "App Style",
    "Switch between dark and light mode.",
    "appearance",
    ["theme", "dark", "light"],
  ],
  [
    "visual-theme",
    "Visual style",
    "App Style",
    "Switch between Marinara and SillyTavern visual themes.",
    "appearance",
    ["theme", "style", "sillytavern", "marinara"],
  ],
  [
    "font-family",
    "Font",
    "Text & Scale",
    "Choose the font used across the app.",
    "appearance",
    ["font", "typeface", "typography"],
  ],
  [
    "display-size",
    "Display size",
    "Text & Scale",
    "Adjust the base font size across the app.",
    "appearance",
    ["font size", "scale", "readability"],
  ],
  [
    "chat-font-size",
    "Chat font size",
    "Text & Scale",
    "Adjust the font size of chat messages.",
    "appearance",
    ["text size", "message size", "readability"],
  ],
  [
    "conversation-layout",
    "Chat layout",
    "Conversation Display",
    "Switch Conversation messages between rows and bubbles.",
    "appearance",
    ["conversation", "bubbles", "linear"],
  ],
  [
    "tracker-panel",
    "Tracker panel",
    "Tracker Panel",
    "Show or hide the Roleplay HUD tracker panel.",
    "appearance",
    ["tracker", "hud", "roleplay"],
  ],
  [
    "weather-effects",
    "Dynamic weather effects",
    "Atmosphere",
    "Show animated weather particles from story context.",
    "appearance",
    ["weather", "rain", "snow", "fog"],
  ],
  [
    "queue-media-generation",
    "Queue media generation requests",
    "Overall Generations",
    "Send image and video generation jobs one at a time per connection.",
    "generations",
    ["media", "image", "video", "queue"],
  ],
  [
    "image-prompt-review",
    "Review media prompts before sending",
    "Overall Generations",
    "Review supported media prompts before provider submission.",
    "generations",
    ["image", "video", "media", "prompt", "review"],
  ],
  [
    "image-style-profiles",
    "Image style profiles",
    "Image Generation",
    "Tune reusable image prompt style profiles.",
    "generations",
    ["image", "style", "anime", "realistic"],
  ],
  [
    "video-scene-duration",
    "Scene video fallback length",
    "Video Generation",
    "Set fallback duration for generated scene videos.",
    "generations",
    ["video", "duration", "length"],
  ],
  [
    "personal-extensions",
    "Personal extensions",
    "Personal Extensions",
    "Manage sandboxed extensions authored by Professor Mari.",
    "addons",
    ["extensions", "addons", "browser", "server"],
  ],
  [
    "theme-library",
    "Theme library",
    "Theme Library",
    "Manage synced themes and custom theme CSS.",
    "addons",
    ["themes", "custom css", "css", "library"],
  ],
  [
    "release-channel",
    "Release channel",
    "Updates",
    "Choose which release channel update checks follow.",
    "advanced",
    ["updates", "branch", "version"],
  ],
  [
    "copy-support-diagnostics",
    "Copy diagnostics",
    "Support Diagnostics",
    "Copy system and active model details for support.",
    "advanced",
    ["support", "diagnostics", "system info", "gpu"],
  ],
  [
    "automatic-backups",
    "Automatic backups",
    "Backup & Export",
    "Schedule full backups and choose archive retention.",
    "advanced",
    ["backup", "daily", "weekly", "scheduled"],
  ],
  [
    "debug-mode",
    "Debug mode",
    "Message Tools",
    "Log model payloads in the server console.",
    "advanced",
    ["debug", "logs", "prompt", "console"],
  ],
] as const satisfies readonly [string, string, string, string, SettingsTab, readonly string[]][];

export function getOmnibarSettingsDestinations(): OmnibarSettingsDestination[] {
  const result: OmnibarSettingsDestination[] = [];
  for (const [tab, title, description, controlId, aliases] of sections) {
    result.push({
      id: `settings-section:${tab}`,
      title: { key: `commandCenter.settings.sections.${tab}.title`, fallback: title },
      description: { key: `commandCenter.settings.sections.${tab}.description`, fallback: description },
      aliases: aliases.map((alias, index) => ({
        key: `commandCenter.settings.sections.${tab}.alias.${index}`,
        fallback: alias,
      })),
      tab,
      section: tab,
      sectionLabel: { key: `commandCenter.settings.sections.${tab}.title`, fallback: title },
      controlId,
    });
  }
  for (const [controlId, title, sectionLabel, description, tab, aliases] of controls) {
    result.push({
      id: `settings-control:${controlId}`,
      title: { key: `commandCenter.settings.controls.${controlId}.title`, fallback: title },
      description: { key: `commandCenter.settings.controls.${controlId}.description`, fallback: description },
      aliases: [...aliases, sectionLabel].map((alias, index) => ({
        key: `commandCenter.settings.controls.${controlId}.alias.${index}`,
        fallback: alias,
      })),
      tab,
      section: controlId,
      sectionLabel: {
        key: `commandCenter.settings.controls.${controlId}.section`,
        fallback: sectionLabel,
      },
      controlId,
    });
  }
  return result;
}
