// i18n.js - minimal dictionary + DOM bindings

export const DICT = {
  zh: {
    appTitle: "五行关系图谱",
    appSubtitle: "相生相克 · 子母 · 乘侮 · 关系查询",
    navHome: "主图",
    navLookup: "关系查询",
    navSim: "失衡模拟",
    navGlossary: "术语",
    navAbout: "关于",
    navGithub: "GitHub",
    footerNote: "教学/科普用途：不提供医疗诊断或处方建议。",

    homeTitle: "交互主图",
    homeDesc: "点击任一行查看：母(生我)/子(我生)/所胜(我克)/所不胜(克我)。用开关叠加显示相生、相克、相乘、相侮、母子相及。",
    togglesTitle: "显示层",
    toggleSheng: "相生",
    toggleKe: "相克",
    toggleCheng: "相乘(倍克)",
    toggleWu: "相侮(反克)",
    toggleMotherChild: "母子相及",
    quickTips: "提示：失衡层（相乘/相侮/母子相及）默认由“失衡模拟”页的选择驱动。",

    cardTitle: "关系卡片",
    selectHint: "请选择一个元素…",

    lookupTitle: "A 对 B 是什么关系？",
    lookupDesc: "选择两个元素，自动给出相生/相克/母子/所胜所不胜等解释。",
    resultTitle: "结果",

    simTitle: "失衡模拟器（透明规则）",
    simDesc: "选择每一行的状态（正常/太过/不及），App 用简单可解释的规则推导：相乘、相侮、母子相及，并叠加到主图。",
    simNote: "注意：这不是临床判定模型；这里只展示概念性推导。",
    normal: "正常",
    excess: "太过",
    deficient: "不及",
    applyToDiagram: "将结果叠加到主图",

    glossaryTitle: "术语小词典",
    aboutTitle: "关于与素材",
    aboutDesc: "本项目为纯前端静态站点，可直接部署到 Vercel。图形为本项目自绘 SVG，另附 Wikimedia Commons 的五行图作为参考素材并在此处致谢。"
  },
  en: {
    appTitle: "Wu Xing Explorer",
    appSubtitle: "Generating · Controlling · Mother–Child · Imbalance",
    navHome: "Diagram",
    navLookup: "Lookup",
    navSim: "Simulator",
    navGlossary: "Glossary",
    navAbout: "About",
    navGithub: "GitHub",
    footerNote: "Educational use only. Not medical advice.",

    homeTitle: "Interactive Diagram",
    homeDesc: "Click an element to see mother/child and controlling relations. Use toggles to show generating, controlling, overacting, insulting, and mother–child transmission layers.",
    togglesTitle: "Layers",
    toggleSheng: "Generating",
    toggleKe: "Controlling",
    toggleCheng: "Overacting (Cheng)",
    toggleWu: "Insulting (Wu)",
    toggleMotherChild: "Mother–child",
    quickTips: "Tip: imbalance layers are driven by the Simulator page by default.",

    cardTitle: "Relationship Card",
    selectHint: "Pick an element…",

    lookupTitle: "What is the relation of A to B?",
    lookupDesc: "Choose two elements; get generating/controlling plus mother/child & control direction explanation.",
    resultTitle: "Result",

    simTitle: "Imbalance Simulator (explainable)",
    simDesc: "Pick each element’s state (normal / excess / deficient). The app uses simple heuristics to infer overacting, insulting, and mother–child transmission, then overlays them on the main diagram.",
    simNote: "Not a clinical model; concept demo only.",
    normal: "Normal",
    excess: "Excess",
    deficient: "Deficient",
    applyToDiagram: "Overlay on diagram",

    glossaryTitle: "Glossary",
    aboutTitle: "About & Assets",
    aboutDesc: "This is a static frontend site deployable on Vercel. Diagram is an original SVG for this project. Wikimedia Commons Wu Xing diagrams are included as reference assets with attribution."
  }
};

export function getLang(){
  const saved = localStorage.getItem("lang");
  return saved === "en" ? "en" : "zh";
}
export function setLang(lang){
  localStorage.setItem("lang", lang);
}

export function t(lang, key){
  return (DICT[lang] && DICT[lang][key]) || key;
}

export function applyI18n(lang, root=document){
  root.querySelectorAll("[data-i18n]").forEach(el=>{
    const key = el.getAttribute("data-i18n");
    el.textContent = t(lang, key);
  });
}
