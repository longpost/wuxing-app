import { ELEMENTS, LABELS, elementCard, relationship, predictImbalance, STRATEGY, GLOSSARY, byId } from "./data.js";
import { applyI18n, getLang, setLang, t } from "./i18n.js";

const appEl = document.getElementById("app");
const langBtn = document.getElementById("langBtn");
const langLabel = document.getElementById("langLabel");

const STORAGE = {
  overlay: "wuxing_overlay",
  sim: "wuxing_sim_state"
};

let lang = getLang();
let selected = "wood";

// Layer toggles (base)
let layers = {
  sheng: true,
  ke: true,
  cheng: false,
  wu: false,
  motherChild: false
};

// Simulator state
let simState = loadSimState();
let overlay = loadOverlay(); // computed predictions cached when user clicks "apply"

function loadOverlay(){
  try {
    const x = JSON.parse(localStorage.getItem(STORAGE.overlay) || "null");
    return x && typeof x === "object" ? x : null;
  } catch { return null; }
}
function saveOverlay(x){
  localStorage.setItem(STORAGE.overlay, JSON.stringify(x));
}
function loadSimState(){
  try{
    const x = JSON.parse(localStorage.getItem(STORAGE.sim) || "null");
    if(!x || typeof x !== "object") return defaultSimState();
    return { ...defaultSimState(), ...x };
  } catch { return defaultSimState(); }
}
function saveSimState(x){
  localStorage.setItem(STORAGE.sim, JSON.stringify(x));
}
function defaultSimState(){
  const st = {};
  for(const e of ELEMENTS) st[e.id] = "normal";
  return st;
}

function setActiveNav(){
  const route = location.hash.replace("#", "") || "/";
  document.querySelectorAll(".navlink").forEach(a=>{
    a.classList.toggle("active", a.getAttribute("data-route") === route);
  });
}

function h(tag, attrs={}, children=[]){
  const el = document.createElement(tag);
  for(const [k,v] of Object.entries(attrs)){
    if(k === "class") el.className = v;
    else if(k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2).toLowerCase(), v);
    else if(v === false || v === null || v === undefined) continue;
    else el.setAttribute(k, String(v));
  }
  for(const ch of [].concat(children)){
    if(ch === null || ch === undefined) continue;
    if(typeof ch === "string") el.appendChild(document.createTextNode(ch));
    else el.appendChild(ch);
  }
  return el;
}

function cardShell(titleKey, descKey, right=null, bodyChildren=[]){
  return h("div", { class:"card" }, [
    h("div", { class:"hd" }, [
      h("div", {}, [
        h("h2", { "data-i18n": titleKey }, [t(lang,titleKey)]),
        descKey ? h("p", { "data-i18n": descKey }, [t(lang,descKey)]) : null
      ]),
      right
    ]),
    h("div", { class:"bd" }, bodyChildren)
  ]);
}

function badgeDot(kind){
  const map = { good:"good", bad:"bad", warn:"warn", info:"info" };
  return h("span", { class:`badge` }, [
    h("span", { class:`dot ${map[kind]||""}` }),
    h("span", {}, [])
  ]);
}

function render(){
  setActiveNav();
  applyI18n(lang, document);

  const route = location.hash.replace("#", "") || "/";
  appEl.innerHTML = "";
  if(route === "/") return renderHome();
  if(route === "/lookup") return renderLookup();
  if(route === "/sim") return renderSim();
  if(route === "/glossary") return renderGlossary();
  if(route === "/about") return renderAbout();
  return renderHome();
}

function renderHome(){
  const right = h("div", { class:"pills" }, [
    h("span",{class:"pill good"},["相生"]),
    h("span",{class:"pill bad"},["相克"]),
    h("span",{class:"pill warn"},["乘"]),
    h("span",{class:"pill"},["侮"]),
    h("span",{class:"pill"},["母子相及"])
  ]);

  const leftCard = cardShell("homeTitle","homeDesc", null, [
    h("div",{class:"diagram-wrap"},[diagramSvg()]),
    h("hr",{class:"sep"}),
    layerToggles(),
    h("div",{class:"small","data-i18n":"quickTips"},[t(lang,"quickTips")]),
  ]);

  const infoCard = cardShell("cardTitle", null, right, [
    h("div",{ "data-rightcard":"1" }, [elementInfoCard(selected)])
  ]);

  appEl.appendChild(h("div",{class:"grid"},[leftCard, infoCard]));
  refreshDiagramVisibility();
}

function layerToggles(){
  const wrap = h("div",{},[
    h("div",{class:"row"},[
      h("div",{class:"badge"},[
        h("span",{class:"dot good"}), h("span",{"data-i18n":"toggleSheng"},[t(lang,"toggleSheng")])
      ]),
      toggle("sheng"),
      h("div",{class:"badge"},[
        h("span",{class:"dot bad"}), h("span",{"data-i18n":"toggleKe"},[t(lang,"toggleKe")])
      ]),
      toggle("ke"),
    ]),
    h("div",{class:"row", style:"margin-top:10px"},[
      h("div",{class:"badge"},[
        h("span",{class:"dot warn"}), h("span",{"data-i18n":"toggleCheng"},[t(lang,"toggleCheng")])
      ]),
      toggle("cheng"),
      h("div",{class:"badge"},[
        h("span",{class:"dot info"}), h("span",{"data-i18n":"toggleWu"},[t(lang,"toggleWu")])
      ]),
      toggle("wu"),
      h("div",{class:"badge"},[
        h("span",{class:"dot"}), h("span",{"data-i18n":"toggleMotherChild"},[t(lang,"toggleMotherChild")])
      ]),
      toggle("motherChild")
    ])
  ]);

  return cardShell("togglesTitle", null, null, [wrap]);
}

function toggle(key){
  const id = `toggle_${key}`;
  const btn = h("button",{
    class:`btn secondary`,
    id,
    onClick: ()=>{
      layers[key] = !layers[key];
      refreshDiagramVisibility();
      btn.textContent = layers[key] ? "ON" : "OFF";
    }
  },[layers[key] ? "ON" : "OFF"]);
  return btn;
}

function elementInfoCard(id){
  const c = elementCard(id);
  const L = LABELS[lang];
  const pill = (txt, kind="") => h("span",{class:`pill ${kind}`},[txt]);

  const elName = lang==="zh" ? `${c.el.zh}` : c.el.en;

  const relGrid = h("div",{class:"kv"},[
    h("div",{class:"k"},[L.mother]),
    h("div",{class:"v"},[nameOf(c.mother)]),
    h("div",{class:"k"},[L.child]),
    h("div",{class:"v"},[nameOf(c.child)]),
    h("div",{class:"k"},[L.controlsMe]),
    h("div",{class:"v"},[nameOf(c.controlsMe)]),
    h("div",{class:"k"},[L.iControl]),
    h("div",{class:"v"},[nameOf(c.iControl)]),
  ]);

  const abnormal = h("div",{},[
    h("div",{class:"pills", style:"margin-top:10px"},[
      pill(L.overacting,"warn"),
      pill(L.insulting),
      pill(L.motherToChild),
      pill(L.childToMother),
    ]),
    h("div",{class:"small", style:"margin-top:8px"},[
      lang==="zh"
        ? "“相乘/相侮/母子相及”属于失衡层：去“失衡模拟”页选择太过/不及后，再回主图叠加看路径。"
        : "Imbalance layers (Cheng/Wu/Mother–child) are driven by the Simulator. Pick states there and overlay on the diagram."
    ])
  ]);

  return h("div",{},[
    h("div",{class:"pills"},[
      h("span",{class:`pill ${c.el.colorHint||""}`},[elName]),
      h("span",{class:"pill"},[lang==="zh" ? c.el.id : c.el.id.toUpperCase()])
    ]),
    h("hr",{class:"sep"}),
    relGrid,
    h("hr",{class:"sep"}),
    abnormal
  ]);
}

function nameOf(el){
  return lang==="zh" ? `${el.zh}` : el.en;
}

function diagramSvg(){
  // Coordinates in 800x520
  const nodes = {
    wood:  { x: 180, y: 120 },
    fire:  { x: 400, y: 70 },
    earth: { x: 620, y: 120 },
    metal: { x: 560, y: 360 },
    water: { x: 240, y: 360 }
  };

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox","0 0 800 520");
  svg.setAttribute("role","img");
  svg.setAttribute("aria-label","Wu Xing Diagram");

  const defs = document.createElementNS(svgNS,"defs");
  defs.innerHTML = `
    <marker id="arrowGood" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L10,5 L0,10 z" fill="rgba(134,239,172,.85)"></path>
    </marker>
    <marker id="arrowBad" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L10,5 L0,10 z" fill="rgba(253,164,175,.85)"></path>
    </marker>
    <marker id="arrowWarn" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L10,5 L0,10 z" fill="rgba(251,191,36,.95)"></path>
    </marker>
    <marker id="arrowInfo" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L10,5 L0,10 z" fill="rgba(125,211,252,.95)"></path>
    </marker>
  `;
  svg.appendChild(defs);

  const bg = document.createElementNS(svgNS,"rect");
  bg.setAttribute("x","10"); bg.setAttribute("y","10");
  bg.setAttribute("width","780"); bg.setAttribute("height","500");
  bg.setAttribute("rx","18");
  bg.setAttribute("fill","rgba(255,255,255,.02)");
  bg.setAttribute("stroke","rgba(255,255,255,.07)");
  svg.appendChild(bg);

  // helper for curved edge
  const edgePath = (from, to, bend=0.18)=>{
    const a = nodes[from], b = nodes[to];
    const dx = b.x - a.x, dy = b.y - a.y;
    const mx = (a.x + b.x)/2, my=(a.y+b.y)/2;
    // perpendicular control point
    const nx = -dy, ny = dx;
    const cx = mx + nx * bend;
    const cy = my + ny * bend;
    return `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`;
  };

  // Base edges: generating (outer-ish) and controlling (star-ish)
  const shengEdges = [
    ["wood","fire"],["fire","earth"],["earth","metal"],["metal","water"],["water","wood"]
  ];
  const keEdges = [
    ["wood","earth"],["earth","water"],["water","fire"],["fire","metal"],["metal","wood"]
  ];

  const gSheng = document.createElementNS(svgNS,"g");
  gSheng.setAttribute("id","layer_sheng");
  for(const [a,b] of shengEdges){
    const p = document.createElementNS(svgNS,"path");
    p.setAttribute("class","edge sheng");
    p.setAttribute("d", edgePath(a,b,0.22));
    p.setAttribute("marker-end","url(#arrowGood)");
    gSheng.appendChild(p);
  }
  svg.appendChild(gSheng);

  const gKe = document.createElementNS(svgNS,"g");
  gKe.setAttribute("id","layer_ke");
  for(const [a,b] of keEdges){
    const p = document.createElementNS(svgNS,"path");
    p.setAttribute("class","edge ke");
    p.setAttribute("d", edgePath(a,b,-0.14));
    p.setAttribute("marker-end","url(#arrowBad)");
    gKe.appendChild(p);
  }
  svg.appendChild(gKe);

  // Imbalance layers populated dynamically
  const gCheng = document.createElementNS(svgNS,"g");
  gCheng.setAttribute("id","layer_cheng");
  svg.appendChild(gCheng);

  const gWu = document.createElementNS(svgNS,"g");
  gWu.setAttribute("id","layer_wu");
  svg.appendChild(gWu);

  const gMC = document.createElementNS(svgNS,"g");
  gMC.setAttribute("id","layer_motherChild");
  svg.appendChild(gMC);

  // Nodes
  const gNodes = document.createElementNS(svgNS,"g");
  gNodes.setAttribute("id","nodes");
  for(const e of ELEMENTS){
    const { x, y } = nodes[e.id];
    const g = document.createElementNS(svgNS,"g");
    g.setAttribute("class","node");
    g.setAttribute("data-id", e.id);

    const circle = document.createElementNS(svgNS,"circle");
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", 44);

    const text = document.createElementNS(svgNS,"text");
    text.setAttribute("x", x);
    text.setAttribute("y", y+8);
    text.setAttribute("text-anchor","middle");
    text.setAttribute("font-size","22");
    text.textContent = lang === "zh" ? e.zh : e.en;

    const sub = document.createElementNS(svgNS,"text");
    sub.setAttribute("x", x);
    sub.setAttribute("y", y+32);
    sub.setAttribute("text-anchor","middle");
    sub.setAttribute("font-size","11");
    sub.setAttribute("class","sub");
    sub.textContent = lang === "zh" ? e.id : e.id.toUpperCase();

    g.appendChild(circle);
    g.appendChild(text);
    g.appendChild(sub);

    g.addEventListener("click", ()=>{
      selected = e.id;
      document.querySelectorAll(".node").forEach(n=>n.classList.toggle("active", n.getAttribute("data-id")===selected));
      // rerender right card only
      const right = appEl.querySelector("[data-rightcard]");
      if(right){
        right.innerHTML = "";
        right.appendChild(elementInfoCard(selected));
      }
    });

    gNodes.appendChild(g);
  }
  svg.appendChild(gNodes);

  // Initial active node highlight after first render
  setTimeout(()=>{
    document.querySelectorAll(".node").forEach(n=>n.classList.toggle("active", n.getAttribute("data-id")===selected));
  },0);

  // legend
  const legend = document.createElementNS(svgNS,"g");
  legend.setAttribute("transform","translate(32 430)");
  legend.innerHTML = `
    <text x="0" y="0" fill="rgba(255,255,255,.70)" font-size="12">Legend:</text>
    <circle cx="68" cy="-4" r="5" fill="rgba(134,239,172,.85)"></circle>
    <text x="80" y="0" fill="rgba(255,255,255,.65)" font-size="12">${lang==="zh"?"相生":"Generating"}</text>
    <circle cx="160" cy="-4" r="5" fill="rgba(253,164,175,.85)"></circle>
    <text x="172" y="0" fill="rgba(255,255,255,.65)" font-size="12">${lang==="zh"?"相克":"Controlling"}</text>
    <circle cx="260" cy="-4" r="5" fill="rgba(251,191,36,.95)"></circle>
    <text x="272" y="0" fill="rgba(255,255,255,.65)" font-size="12">${lang==="zh"?"乘":"Cheng"}</text>
    <circle cx="320" cy="-4" r="5" fill="rgba(125,211,252,.95)"></circle>
    <text x="332" y="0" fill="rgba(255,255,255,.65)" font-size="12">${lang==="zh"?"侮":"Wu"}</text>
  `;
  svg.appendChild(legend);

  // store nodes coords for overlay edges
  svg.__nodes = nodes;
  return svg;
}

function refreshDiagramVisibility(){
  const svg = appEl.querySelector("svg");
  if(!svg) return;

  const setLayer = (id, on)=>{
    const g = svg.querySelector(`#layer_${id}`);
    if(g) g.classList.toggle("hidden", !on);
  };

  setLayer("sheng", layers.sheng);
  setLayer("ke", layers.ke);

  // populate imbalance layers from overlay if present
  updateOverlay(svg);

  setLayer("cheng", layers.cheng);
  setLayer("wu", layers.wu);
  setLayer("motherChild", layers.motherChild);
}

function updateOverlay(svg){
  const nodes = svg.__nodes || {};
  const edgePath = (from, to, bend=0.0)=>{
    const a = nodes[from], b = nodes[to];
    const dx = b.x - a.x, dy = b.y - a.y;
    const mx = (a.x + b.x)/2, my=(a.y+b.y)/2;
    const nx = -dy, ny = dx;
    const cx = mx + nx * bend;
    const cy = my + ny * bend;
    return `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`;
  };

  const gCheng = svg.querySelector("#layer_cheng");
  const gWu = svg.querySelector("#layer_wu");
  const gMC = svg.querySelector("#layer_motherChild");
  if(!gCheng || !gWu || !gMC) return;

  gCheng.innerHTML = "";
  gWu.innerHTML = "";
  gMC.innerHTML = "";

  if(!overlay) return;

  for(const e of (overlay.cheng||[])){
    const p = document.createElementNS("http://www.w3.org/2000/svg","path");
    p.setAttribute("class","edge cheng");
    p.setAttribute("d", edgePath(e.from, e.to, 0.05));
    p.setAttribute("marker-end","url(#arrowWarn)");
    gCheng.appendChild(p);
  }
  for(const e of (overlay.wu||[])){
    const p = document.createElementNS("http://www.w3.org/2000/svg","path");
    p.setAttribute("class","edge wu");
    p.setAttribute("d", edgePath(e.from, e.to, -0.02));
    p.setAttribute("marker-end","url(#arrowInfo)");
    gWu.appendChild(p);
  }
  for(const e of (overlay.motherChild||[])){
    const p = document.createElementNS("http://www.w3.org/2000/svg","path");
    p.setAttribute("class","edge");
    p.setAttribute("style","stroke: rgba(255,255,255,.45); stroke-dasharray: 1 8; stroke-width:2.4");
    p.setAttribute("d", edgePath(e.from, e.to, 0.12));
    p.setAttribute("marker-end","url(#arrowInfo)");
    gMC.appendChild(p);
  }
}

function renderLookup(){
  const A = h("select", { id:"aSel" }, ELEMENTS.map(e=>h("option",{value:e.id},[nameOf(e)])));
  const B = h("select", { id:"bSel" }, ELEMENTS.map(e=>h("option",{value:e.id},[nameOf(e)])));
  A.value = "wood"; B.value = "fire";

  const out = h("div",{});

  const compute = ()=>{
    const a = A.value, b = B.value;
    const r = relationship(a,b);
    out.innerHTML = "";
    out.appendChild(lookupResult(r));
  };

  A.addEventListener("change", compute);
  B.addEventListener("change", compute);

  const panel = cardShell("lookupTitle","lookupDesc",null,[
    h("div",{class:"row"},[
      h("div",{class:"field"},[
        h("label",{},[lang==="zh"?"元素 A":"Element A"]),
        A
      ]),
      h("div",{class:"field"},[
        h("label",{},[lang==="zh"?"元素 B":"Element B"]),
        B
      ])
    ]),
    h("hr",{class:"sep"}),
    h("div",{},[
      h("h3",{"data-i18n":"resultTitle", style:"margin:0 0 10px 0"},[t(lang,"resultTitle")]),
      out
    ])
  ]);

  appEl.appendChild(panel);
  compute();
}

function lookupResult(r){
  const a = byId(r.a), b = byId(r.b);
  const L = LABELS[lang];

  const nameA = a ? nameOf(a) : "";
  const nameB = b ? nameOf(b) : "";

  const lines = [];
  if(r.type === "same"){
    lines.push(lang==="zh" ? "A 和 B 是同一行。" : "A and B are the same element.");
  } else if(r.type === "sheng"){
    lines.push(lang==="zh" ? `${nameA} 生 ${nameB}（A→B：相生）` : `${nameA} generates ${nameB} (A→B).`);
    lines.push(lang==="zh" ? `对 B：A 是其母（生我）。对 A：B 是其子（我生）。` : `For B, A is its mother. For A, B is its child.`);
  } else if(r.type === "sheng-rev"){
    lines.push(lang==="zh" ? `${nameB} 生 ${nameA}（B→A：相生）` : `${nameB} generates ${nameA} (B→A).`);
    lines.push(lang==="zh" ? `对 A：B 是其母（生我）。对 B：A 是其子（我生）。` : `For A, B is its mother. For B, A is its child.`);
  } else if(r.type === "ke"){
    lines.push(lang==="zh" ? `${nameA} 克 ${nameB}（A→B：相克）` : `${nameA} controls ${nameB} (A→B).`);
    lines.push(lang==="zh" ? `对 A：B 为所胜（我克）。对 B：A 为所不胜（克我）。` : `For A: B is what A controls. For B: A controls B.`);
  } else if(r.type === "ke-rev"){
    lines.push(lang==="zh" ? `${nameB} 克 ${nameA}（B→A：相克）` : `${nameB} controls ${nameA} (B→A).`);
    lines.push(lang==="zh" ? `对 B：A 为所胜（我克）。对 A：B 为所不胜（克我）。` : `For B: A is what B controls. For A: B controls A.`);
  } else {
    lines.push(lang==="zh" ? `${nameA} 与 ${nameB}：无直接相生/相克关系（但可通过“中介”形成间接链路）。` : `${nameA} and ${nameB}: no direct generating/controlling relation (indirect chains exist).`);
  }

  return h("div",{class:"kv"},[
    h("div",{class:"k"},[lang==="zh"?"判定":"Decision"]),
    h("div",{class:"v"},[lines[0] || ""]),
    h("div",{class:"k"},[lang==="zh"?"解释":"Explanation"]),
    h("div",{class:"v"},[
      h("ul",{class:"list"}, lines.slice(1).map(x=>h("li",{},[x])))
    ])
  ]);
}

function renderSim(){
  const selects = {};

  const grid = h("div",{class:"kv"},[]);
  for(const e of ELEMENTS){
    const sel = h("select",{});
    sel.innerHTML = `
      <option value="normal">${t(lang,"normal")}</option>
      <option value="excess">${t(lang,"excess")}</option>
      <option value="deficient">${t(lang,"deficient")}</option>
    `;
    sel.value = simState[e.id] || "normal";
    sel.addEventListener("change", ()=>{
      simState[e.id] = sel.value;
      saveSimState(simState);
      preview();
    });
    selects[e.id] = sel;

    grid.appendChild(h("div",{class:"k"},[nameOf(e)]));
    grid.appendChild(h("div",{class:"v"},[sel]));
  }

  const previewBox = h("div",{});
  const applyBtn = h("button",{class:"btn", onClick:()=>{
    overlay = predictImbalance(simState);
    saveOverlay(overlay);
    // auto-enable layers
    layers.cheng = true;
    layers.wu = true;
    layers.motherChild = true;
    location.hash = "#/";
  }},[t(lang,"applyToDiagram")]);

  function preview(){
    const pred = predictImbalance(simState);
    previewBox.innerHTML = "";
    previewBox.appendChild(simPreview(pred));
  }

  const panel = cardShell("simTitle","simDesc",null,[
    h("div",{class:"small","data-i18n":"simNote"},[t(lang,"simNote")]),
    h("hr",{class:"sep"}),
    grid,
    h("hr",{class:"sep"}),
    h("div",{class:"row"},[
      applyBtn,
      h("button",{class:"btn secondary", onClick:()=>{
        simState = defaultSimState();
        saveSimState(simState);
        for(const e of ELEMENTS) selects[e.id].value = "normal";
        preview();
      }},[lang==="zh"?"重置":"Reset"]),
      h("button",{class:"btn secondary", onClick:()=>{
        overlay = null;
        saveOverlay(null);
        // keep layers but nothing to show
        location.hash = "#/";
      }},[lang==="zh"?"清除叠加":"Clear overlay"])
    ]),
    h("hr",{class:"sep"}),
    previewBox,
    h("hr",{class:"sep"}),
    renderStrategyBlocks()
  ]);

  appEl.appendChild(panel);
  preview();
}

function simPreview(pred){
  const box = h("div",{},[
    h("div",{class:"pills"},[
      h("span",{class:"pill warn"},[lang==="zh"?"推导：相乘(倍克)":"Inferred: Overacting (Cheng)"]),
      h("span",{class:"pill"},[lang==="zh"?"推导：相侮(反克)":"Inferred: Insulting (Wu)"]),
      h("span",{class:"pill"},[lang==="zh"?"推导：母子相及":"Inferred: Mother–child"])
    ]),
    h("div",{class:"small", style:"margin-top:8px"},[
      lang==="zh"
        ? "规则（简化可解释）：太过 → 更可能倍克；不及 → 更容易被克；当“克者不及”或“被克者太过” → 更可能反克。母子相及按相生链提示。"
        : "Explainable heuristic: excess tends to overact; deficiency is easier to be overacted upon; if controller is deficient or controlled is excess, reverse control may appear. Mother–child hints follow generating links."
    ])
  ]);

  const listEdges = (edges, label, kindClass)=> h("div",{style:"margin-top:12px"},[
    h("div",{class:"small"},[label]),
    edges.length
      ? h("ul",{class:"list"}, edges.map(e=>h("li",{},[
          `${nameOf(byId(e.from))} → ${nameOf(byId(e.to))}`
        ])))
      : h("div",{class:"small"},[lang==="zh"?"（无）":"(none)"])
  ]);

  box.appendChild(listEdges(pred.cheng||[], lang==="zh"?"相乘路径：":"Cheng edges:", "warn"));
  box.appendChild(listEdges(pred.wu||[], lang==="zh"?"相侮路径：":"Wu edges:", "info"));
  box.appendChild(listEdges(pred.motherChild||[], lang==="zh"?"母子相及提示：":"Mother–child hints:", ""));

  return box;
}

function renderStrategyBlocks(){
  const blocks = STRATEGY.map(s=>{
    const title = lang==="zh" ? s.zhTitle : s.enTitle;
    const bullets = lang==="zh" ? s.zhBullets : s.enBullets;
    return h("div",{style:"margin-top:14px"},[
      h("h3",{style:"margin:0 0 8px 0"},[title]),
      h("ul",{class:"list"}, bullets.map(x=>h("li",{},[x])))
    ]);
  });
  return h("div",{},blocks);
}

function renderGlossary(){
  const q = h("input",{type:"text", placeholder: lang==="zh" ? "搜索术语…" : "Search…"});
  const list = h("div",{});

  const rerender = ()=>{
    const s = (q.value||"").trim().toLowerCase();
    list.innerHTML = "";
    const items = GLOSSARY.filter(it=>{
      if(!s) return true;
      return it.zh.toLowerCase().includes(s) || it.en.toLowerCase().includes(s) || it.zhDesc.toLowerCase().includes(s) || it.enDesc.toLowerCase().includes(s);
    });
    for(const it of items){
      list.appendChild(h("div",{class:"card", style:"margin-top:12px"},[
        h("div",{class:"hd"},[
          h("div",{},[
            h("h2",{},[lang==="zh" ? it.zh : it.en]),
            h("p",{},[lang==="zh" ? it.en : it.zh])
          ])
        ]),
        h("div",{class:"bd"},[
          h("div",{class:"small"},[lang==="zh" ? it.zhDesc : it.enDesc])
        ])
      ]));
    }
    if(items.length === 0){
      list.appendChild(h("div",{class:"small"},[lang==="zh" ? "没有匹配项。" : "No matches."]));
    }
  };

  q.addEventListener("input", rerender);

  const panel = cardShell("glossaryTitle", null, null, [
    h("div",{class:"row"},[
      h("div",{class:"field"},[
        h("label",{},[lang==="zh"?"搜索":"Search"]),
        q
      ])
    ]),
    h("hr",{class:"sep"}),
    list
  ]);

  appEl.appendChild(panel);
  rerender();
}

function renderAbout(){
  const panel = cardShell("aboutTitle","aboutDesc",null,[
    h("div",{class:"small"},[
      lang==="zh"
        ? "部署建议：直接把仓库导入 Vercel（Framework 选 Other），Build Command 留空，Output 目录选根目录即可。"
        : "Deploy: import the repo into Vercel (Framework: Other). Leave Build Command empty; set Output Directory to the repo root."
    ]),
    h("hr",{class:"sep"}),
    h("h3",{style:"margin:0 0 8px 0"},[lang==="zh"?"素材与致谢":"Assets & attribution"]),
    h("ul",{class:"list"},[
      h("li",{},[
        lang==="zh"
          ? "参考素材：Wikimedia Commons 上的多种五行循环示意图（CC0 或 CC BY-SA）。项目 README 中提供原始链接与许可说明。"
          : "Reference assets: Wu Xing diagrams on Wikimedia Commons (CC0 or CC BY-SA). Links & license notes are in the README."
      ])
    ])
  ]);
  appEl.appendChild(panel);
}

function wireLang(){
  langLabel.textContent = (lang === "zh") ? "中文" : "EN";
  langBtn.addEventListener("click", ()=>{
    lang = (lang === "zh") ? "en" : "zh";
    setLang(lang);
    langLabel.textContent = (lang === "zh") ? "中文" : "EN";
    render();
  });
}

window.addEventListener("hashchange", render);
wireLang();
render();
