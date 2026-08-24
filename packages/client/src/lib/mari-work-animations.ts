export type MariWorkAnimation = {
  id: string;
  src: string;
};

const ANIMATIONS = {
  assistant: {
    id: "assistant",
    src: "/sprites/mari/generated/professor-mari-assistant-sheet.png",
  },
  detective: {
    id: "detective",
    src: "/sprites/mari/generated/professor-mari-work-detective.png",
  },
  tea: {
    id: "tea",
    src: "/sprites/mari/generated/professor-mari-work-idea-tea.png",
  },
  books: {
    id: "books",
    src: "/sprites/mari/generated/professor-mari-work-book-tower.png",
  },
  train: {
    id: "train",
    src: "/sprites/mari/generated/professor-mari-work-train.png",
  },
  yarn: {
    id: "yarn",
    src: "/sprites/mari/generated/professor-mari-work-yarn.png",
  },
  deepDive: {
    id: "deep-dive",
    src: "/sprites/mari/generated/professor-mari-work-deep-dive.png",
  },
  airplane: {
    id: "paper-airplane",
    src: "/sprites/mari/generated/professor-mari-work-paper-airplane.png",
  },
  pixelBug: {
    id: "pixel-bug",
    src: "/sprites/mari/generated/professor-mari-inline-pixel-bug-sheet.png",
  },
  telescope: {
    id: "telescope",
    src: "/sprites/mari/generated/professor-mari-work-telescope.png",
  },
  boat: {
    id: "boat",
    src: "/sprites/mari/generated/professor-mari-work-boat.png",
  },
  puzzle: {
    id: "puzzle",
    src: "/sprites/mari/generated/professor-mari-work-puzzle.png",
  },
  spelunking: {
    id: "spelunking",
    src: "/sprites/mari/generated/professor-mari-work-spelunking.png",
  },
} satisfies Record<string, MariWorkAnimation>;

const GENERAL_POOL = [ANIMATIONS.assistant, ANIMATIONS.tea, ANIMATIONS.yarn, ANIMATIONS.airplane, ANIMATIONS.boat];
const RESEARCH_POOL = [
  ANIMATIONS.detective,
  ANIMATIONS.books,
  ANIMATIONS.deepDive,
  ANIMATIONS.telescope,
  ANIMATIONS.spelunking,
];
const PLANNING_POOL = [ANIMATIONS.yarn, ANIMATIONS.tea, ANIMATIONS.airplane, ANIMATIONS.telescope, ANIMATIONS.puzzle];
const FILE_POOL = [ANIMATIONS.assistant, ANIMATIONS.detective, ANIMATIONS.yarn, ANIMATIONS.airplane];
const DEBUG_POOL = [
  ANIMATIONS.pixelBug,
  ANIMATIONS.detective,
  ANIMATIONS.deepDive,
  ANIMATIONS.puzzle,
  ANIMATIONS.spelunking,
];
const LONG_RUNNING_POOL = [ANIMATIONS.train, ANIMATIONS.tea, ANIMATIONS.books, ANIMATIONS.boat];

function stableHash(value: string): number {
  let hash = 2_166_136_261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  return hash >>> 0;
}

export function selectMariWorkAnimation({
  seed,
  activity,
  toolNames,
}: {
  seed: string;
  activity: string;
  toolNames: string[];
}): MariWorkAnimation {
  const signal = `${activity} ${toolNames.join(" ")}`.toLowerCase();
  let pool = GENERAL_POOL;

  if (/error|fail|debug|repair|fix|diagnos|test/.test(signal)) pool = DEBUG_POOL;
  else if (/search|research|read|fetch|browse|wiki|inspect|find|grep/.test(signal)) pool = RESEARCH_POOL;
  else if (/plan|reason|think|map|decide|compare|analy/.test(signal)) pool = PLANNING_POOL;
  else if (/write|edit|patch|create|update|remove|file/.test(signal)) pool = FILE_POOL;
  else if (/install|build|compile|command|shell|bash|terminal|wait/.test(signal)) pool = LONG_RUNNING_POOL;

  return pool[stableHash(seed) % pool.length] ?? ANIMATIONS.assistant;
}
