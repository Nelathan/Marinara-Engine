export type MariWorkAnimation = {
  id: string;
  src: string;
};

const animation = (id: string, filename: string): MariWorkAnimation => ({
  id,
  src: `/sprites/mari/generated/${filename}`,
});

const ANIMATIONS = {
  assistant: animation("assistant", "professor-mari-assistant-sheet.png"),
  detective: animation("detective", "professor-mari-work-detective.png"),
  tea: animation("tea", "professor-mari-work-idea-tea.png"),
  books: animation("books", "professor-mari-work-book-tower.png"),
  train: animation("train", "professor-mari-work-train.png"),
  yarn: animation("yarn", "professor-mari-work-yarn.png"),
  deepDive: animation("deep-dive", "professor-mari-work-deep-dive.png"),
  airplane: animation("paper-airplane", "professor-mari-work-paper-airplane.png"),
  pixelBug: animation("pixel-bug", "professor-mari-inline-pixel-bug-sheet.png"),
  telescope: animation("telescope", "professor-mari-work-telescope.png"),
  boat: animation("boat", "professor-mari-work-boat.png"),
  puzzle: animation("puzzle", "professor-mari-work-puzzle.png"),
  spelunking: animation("spelunking", "professor-mari-work-spelunking.png"),
  origami: animation("origami", "professor-mari-work-origami.png"),
  constellation: animation("constellation", "professor-mari-work-constellation.png"),
  clockwork: animation("clockwork", "professor-mari-work-clockwork.png"),
  typewriter: animation("typewriter", "professor-mari-work-typewriter.png"),
  rocket: animation("rocket", "professor-mari-work-rocket.png"),
  images: animation("images", "professor-mari-work-images.png"),
  thinkingNotes: animation("thinking-notes", "professor-mari-work-thinking-notes.png"),
};

const GENERAL_POOL = [
  ANIMATIONS.assistant,
  ANIMATIONS.tea,
  ANIMATIONS.yarn,
  ANIMATIONS.airplane,
  ANIMATIONS.boat,
  ANIMATIONS.origami,
  ANIMATIONS.clockwork,
  ANIMATIONS.rocket,
  ANIMATIONS.thinkingNotes,
];
const RESEARCH_POOL = [
  ANIMATIONS.detective,
  ANIMATIONS.books,
  ANIMATIONS.deepDive,
  ANIMATIONS.telescope,
  ANIMATIONS.spelunking,
  ANIMATIONS.constellation,
  ANIMATIONS.thinkingNotes,
];
const PLANNING_POOL = [
  ANIMATIONS.yarn,
  ANIMATIONS.tea,
  ANIMATIONS.airplane,
  ANIMATIONS.telescope,
  ANIMATIONS.puzzle,
  ANIMATIONS.origami,
  ANIMATIONS.constellation,
];
const FILE_POOL = [
  ANIMATIONS.assistant,
  ANIMATIONS.detective,
  ANIMATIONS.yarn,
  ANIMATIONS.airplane,
  ANIMATIONS.origami,
  ANIMATIONS.typewriter,
];
const DEBUG_POOL = [
  ANIMATIONS.pixelBug,
  ANIMATIONS.detective,
  ANIMATIONS.deepDive,
  ANIMATIONS.puzzle,
  ANIMATIONS.spelunking,
  ANIMATIONS.clockwork,
];
const LONG_RUNNING_POOL = [
  ANIMATIONS.train,
  ANIMATIONS.tea,
  ANIMATIONS.books,
  ANIMATIONS.boat,
  ANIMATIONS.clockwork,
  ANIMATIONS.rocket,
];

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
  if (/image|picture|portrait|sprite|thumbnail|gallery|illustrat|crop|visual/.test(signal)) {
    pool = [ANIMATIONS.images];
  } else if (/error|fail|debug|repair|fix|diagnos|test/.test(signal)) {
    pool = DEBUG_POOL;
  } else if (/search|research|read|fetch|browse|wiki|inspect|find|grep/.test(signal)) {
    pool = RESEARCH_POOL;
  } else if (/plan|reason|think|map|decid|compar|analy/.test(signal)) {
    pool = PLANNING_POOL;
  } else if (/write|edit|patch|create|update|remove|file/.test(signal)) {
    pool = FILE_POOL;
  } else if (/install|build|compile|command|shell|bash|terminal|wait/.test(signal)) {
    pool = LONG_RUNNING_POOL;
  }
  return pool[stableHash(seed) % pool.length] ?? ANIMATIONS.assistant;
}
