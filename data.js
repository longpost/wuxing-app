// data.js - content + relationship engine (no external deps)

export const ELEMENTS = [
  { id: "wood", zh: "木", en: "Wood", colorHint: "good" },
  { id: "fire", zh: "火", en: "Fire", colorHint: "warn" },
  { id: "earth", zh: "土", en: "Earth", colorHint: "info" },
  { id: "metal", zh: "金", en: "Metal", colorHint: "bad" },
  { id: "water", zh: "水", en: "Water", colorHint: "info" }
];

// 相生: A -> B means A generates B (我生)
export const GENERATES = ["wood","fire","earth","metal","water"];

// 相克: A -> B means A controls (克) B (我克)
export const CONTROLS = [
  ["wood","earth"],
  ["earth","water"],
  ["water","fire"],
  ["fire","metal"],
  ["metal","wood"]
];

export const LABELS = {
  zh: {
    generates: "相生",
    controls: "相克",
    mother: "母(生我)",
    child: "子(我生)",
    iControl: "我克(所胜)",
    controlsMe: "克我(所不胜)",
    overacting: "相乘(倍克)",
    insulting: "相侮(反克)",
    motherToChild: "母病及子",
    childToMother: "子病及母",
  },
  en: {
    generates: "Generating",
    controls: "Controlling",
    mother: "Mother (generates me)",
    child: "Child (I generate)",
    iControl: "I control",
    controlsMe: "Controls me",
    overacting: "Overacting (Cheng)",
    insulting: "Insulting (Wu)",
    motherToChild: "Mother → child",
    childToMother: "Child → mother",
  }
};

export const GLOSSARY = [
  {
    key: "wuxing",
    zh: "五行（五运/五行学说）",
    en: "Wu Xing (Five Phases/Agents)",
    zhDesc: "五行是描述事物相互关系的一套模型，核心是“生、克、制化”，并可用于解释平衡与失衡（乘、侮、母子相及）。",
    enDesc: "A relational model centered on generating/controlling and their balancing dynamics; used to describe stability and imbalance (overacting, insulting, mother–child transmission)."
  },
  {
    key: "shengke",
    zh: "相生/相克",
    en: "Generating / Controlling",
    zhDesc: "相生：木→火→土→金→水→木；相克：木克土、土克水、水克火、火克金、金克木。",
    enDesc: "Generating cycle: Wood→Fire→Earth→Metal→Water→Wood. Controlling cycle: Wood→Earth→Water→Fire→Metal→Wood."
  },
  {
    key: "mzi",
    zh: "母子（生我/我生）",
    en: "Mother–Child (generates me / I generate)",
    zhDesc: "对某一行：生我者为母；我生者为子。用于讲“补母泻子”等思路（本 App 只做关系说明）。",
    enDesc: "For an element: the one that generates it is its mother; the one it generates is its child."
  },
  {
    key: "suosheng",
    zh: "所胜/所不胜",
    en: "I control / controls me",
    zhDesc: "我克者为我之“所胜”；克我者为我之“所不胜”。",
    enDesc: "The element I control vs the element that controls me."
  },
  {
    key: "chengwu",
    zh: "相乘/相侮",
    en: "Overacting / Insulting",
    zhDesc: "相乘：按相克方向克得太过；相侮：在一定条件下反向克制（“反克/反侮”）。",
    enDesc: "Overacting: excessive controlling along the normal controlling direction. Insulting: reverse controlling (counter-control) under imbalance."
  },
  {
    key: "motherchild",
    zh: "母子相及",
    en: "Mother–child transmission",
    zhDesc: "母病可及子、子病亦可及母，用于描述传变路径（例如“水虚及木”“木亢犯水”等表达）。",
    enDesc: "Disease may transmit from mother to child or vice versa; a common way to describe propagation paths."
  }
];

export const STRATEGY = [
  {
    id: "cheng",
    zhTitle: "遇到“相乘（倍克）”怎么纠偏？",
    enTitle: "How to reason about Overacting (Cheng)?",
    zhBullets: [
      "本质：相克方向“太过”，强者克弱者过猛。",
      "思路 1：降强——让“太过”的一方回到正常强度。",
      "思路 2：扶弱——让“被克”的一方更能承受。",
      "思路 3：看母子——强者为什么强？常可追母与子两个方向。"
    ],
    enBullets: [
      "Essence: excessive control along the normal controlling direction.",
      "Option 1: reduce the overly-strong element.",
      "Option 2: support the controlled (weakened) element.",
      "Option 3: check mother–child links to understand why strength is excessive."
    ]
  },
  {
    id: "wu",
    zhTitle: "遇到“相侮（反克）”怎么纠偏？",
    enTitle: "How to reason about Insulting (Wu)?",
    zhBullets: [
      "本质：正常相克失序，弱者反制强者，或强者失其制。",
      "思路 1：先扶‘应当克’的一方恢复其制约力（有时是本虚）。",
      "思路 2：再抑‘反克’的一方之亢逆（有时是标实）。",
      "思路 3：结合母子：反克往往不是凭空发生，常有根因。"
    ],
    enBullets: [
      "Essence: control order breaks; reverse control appears.",
      "Option 1: restore the element that should normally control (often deficient).",
      "Option 2: calm the counter-controlling element (often excess).",
      "Option 3: trace mother–child roots; reverse control is usually secondary."
    ]
  }
];

// --- Helpers

export const byId = (id) => ELEMENTS.find(e => e.id === id);

export function nextInGenerating(id){
  const i = GENERATES.indexOf(id);
  return GENERATES[(i+1) % GENERATES.length];
}
export function prevInGenerating(id){
  const i = GENERATES.indexOf(id);
  return GENERATES[(i-1 + GENERATES.length) % GENERATES.length];
}
export function controlsTargets(id){
  return CONTROLS.filter(([a,_]) => a===id).map(([_,b])=>b);
}
export function controlledBy(id){
  return CONTROLS.filter(([_,b]) => b===id).map(([a,_])=>a);
}

export function relationship(a, b){
  if(a===b) return { type:"same" };
  if(nextInGenerating(a)===b) return { type:"sheng", a, b };        // a generates b
  if(nextInGenerating(b)===a) return { type:"sheng-rev", a, b };    // b generates a
  if(controlsTargets(a).includes(b)) return { type:"ke", a, b };     // a controls b
  if(controlsTargets(b).includes(a)) return { type:"ke-rev", a, b }; // b controls a
  return { type:"none", a, b };
}

// Derive a structured card for a given element (mother/child, etc.)
export function elementCard(id){
  const el = byId(id);
  const mother = prevInGenerating(id);
  const child = nextInGenerating(id);
  const iControl = controlsTargets(id)[0];
  const controlsMe = controlledBy(id)[0];

  return {
    el,
    mother: byId(mother),
    child: byId(child),
    iControl: byId(iControl),
    controlsMe: byId(controlsMe)
  };
}

// --- Imbalance model (simple, transparent, explainable)
//
// Inputs: a state map { wood: "normal"|"excess"|"deficient", ... }
// Outputs: predicted edges for cheng (overacting) and wu (insulting)
//
// Heuristic:
/// - Excess tends to produce overacting (cheng) along controlling direction.
/// - Deficiency tends to invite overacting from its controller.
/// - Insulting (wu) can show up when the controller is deficient OR the controlled is excess (counter-control).
export function predictImbalance(state){
  const cheng = [];
  const wu = [];

  for (const [a,b] of CONTROLS){
    const aState = state[a] || "normal";
    const bState = state[b] || "normal";

    // Overacting
    if(aState === "excess" || bState === "deficient"){
      cheng.push({ from:a, to:b, kind:"cheng" });
    }

    // Insulting (reverse)
    if(aState === "deficient" || bState === "excess"){
      // b may counter-control a
      wu.push({ from:b, to:a, kind:"wu" });
    }
  }

  // Mother-child transmission hints
  const motherChild = [];
  for (const id of GENERATES){
    const child = nextInGenerating(id);
    const m = state[id] || "normal";
    const c = state[child] || "normal";

    if(m !== "normal") motherChild.push({ from:id, to:child, kind:"motherToChild" });
    if(c !== "normal") motherChild.push({ from:child, to:id, kind:"childToMother" });
  }

  return { cheng, wu, motherChild };
}
