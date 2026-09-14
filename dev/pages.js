const checklistView=["checklist","roadmap"].includes(new URLSearchParams(location.search).get("view"));
document.body.classList.toggle("roadmap",checklistView);
document.querySelector(`[data-tool="${checklistView?"roadmap":"pages"}"]`)?.setAttribute("aria-current","page");
if(checklistView){document.title="Marketing roadmap · AI Receptionist";document.querySelector("h1").textContent="Marketing roadmap";document.querySelector(".lede").textContent="One plan, broken into phases. Check off the work as you review it and see what remains before launch.";}
const directory = document.querySelector("#directory");
const search = document.querySelector(".search");
const resultCount = document.querySelector("#results-count");
let pages = [];
let activeFilter = "all";
let sort = "section";
let loaded = false;
const completionKey = "ai-receptionist-page-completion-v1";
const roadmapKey = "ai-receptionist-marketing-roadmap-v1";
let completed = new Set();
const completionStatus = document.querySelector("#completion-status");

/* Marks are saved to the workspace file (dev/progress.json, through the preview server) and
   mirrored in this browser. On load the two are merged, so a mark made earlier in any browser
   is kept and written back to the file. */
const PROGRESS_URL = "/__dev/progress.json";
const progress = { pages: new Set(), roadmap: new Set() };
function localSet(key) {
  try { const saved = JSON.parse(localStorage.getItem(key) ?? "[]"); return new Set(Array.isArray(saved) ? saved.filter(id => typeof id === "string") : []); }
  catch { return new Set(); }
}
async function pushProgress() {
  const body = JSON.stringify({ pages: [...progress.pages], roadmap: [...progress.roadmap] });
  const response = await fetch(PROGRESS_URL, { method: "PUT", headers: { "Content-Type": "application/json" }, body, cache: "no-store" });
  if (!response.ok) throw new Error(`progress ${response.status}`);
}
const progressReady = (async () => {
  let fromFile = { pages: [], roadmap: [] };
  let fileOk = false;
  try {
    const response = await fetch(PROGRESS_URL, { cache: "no-store" });
    if (response.ok) { fromFile = await response.json(); fileOk = true; }
  } catch { /* preview server unreachable: browser copy only */ }
  const merged = {
    pages: new Set([...(fromFile.pages ?? []), ...localSet(completionKey)]),
    roadmap: new Set([...(fromFile.roadmap ?? []), ...localSet(roadmapKey)]),
  };
  progress.pages = merged.pages; progress.roadmap = merged.roadmap;
  completed = new Set(progress.pages);
  const grew = fileOk && (merged.pages.size !== (fromFile.pages ?? []).length || merged.roadmap.size !== (fromFile.roadmap ?? []).length);
  if (grew) { try { await pushProgress(); } catch { /* reported on the next change */ } }
  return fileOk;
})();
/** Save one mark everywhere it can be saved; tells the person exactly where it landed. */
async function saveMark(kind, key, id, checked, label) {
  const set = progress[kind];
  if (checked) set.add(id); else set.delete(id);
  try { localStorage.setItem(key, JSON.stringify([...set])); } catch { /* the file is the record */ }
  try {
    await pushProgress();
    completionStatus.textContent = `${label} marked ${checked ? "done" : "not done"}. Saved to the workspace.`;
    return true;
  } catch {
    completionStatus.textContent = `${label} marked ${checked ? "done" : "not done"}. Saved in this browser only: the workspace file could not be written. Is the preview server running?`;
    return false;
  }
}
const sections = [
  { key: "application", title: "Application", eyebrow: "Customer & staff workspace", description: "Accounts, bookings, business demos and staff tools. Sign-in still applies.", grouped: true },
  { key: "marketing", title: "Marketing Site", eyebrow: "The public-facing product", description: "Homepage & plans, Features & benefits, Explore demos, and marketing images & videos." },
  { key: "study", title: "Design Studies", eyebrow: "Drafts & experiments", description: "Visual directions and imagery to review alongside the original site." },
  { key: "internal", title: "Internal Tools", eyebrow: "Workspace utilities", description: "The page index, user journey and access tools. Each page shows its access requirements." },
];

function sectionKey(page) {
  if (page.kind === "internal" || page.group === "Internal tools") return "internal";
  if (page.group === "Marketing") return "marketing";
  if (page.kind === "study") return "study";
  return "application";
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function age(page) {
  if (!page.updatedAt || !Number.isFinite(Date.parse(page.updatedAt))) return null;
  const today = new Date();
  const edited = new Date(page.updatedAt);
  // Compare calendar days so an edit late yesterday is not labelled Today.
  return Math.max(0, Math.round((Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
    - Date.UTC(edited.getFullYear(), edited.getMonth(), edited.getDate())) / 86400000));
}

function recency(page) {
  const days = age(page);
  return days === null ? "unknown" : days <= 14 ? "recent" : days < 45 ? "quiet" : "attention";
}

function dateLabel(page) {
  const days = age(page);
  if (days === null) return "Date unavailable";
  const relative = days === 0 ? "Today" : days === 1 ? "Yesterday" : `${days} days ago`;
  return `${relative} · ${new Date(page.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
}

function row(page) {
  const card = element("article", "page-row");
  card.dataset.done = String(completed.has(page.id));
  const link = element("a", "page-link");
  link.href = page.href;
  if (page.thumbnail) {
    const cover = element("img", "page-cover");
    cover.src = page.thumbnail;
    cover.alt = `${page.label} — page preview`;
    cover.loading = "lazy";
    cover.width = 1280; cover.height = 800;
    cover.addEventListener("error", () => cover.remove());
    link.append(cover);
  }
  const body = element("span", "page-content");
  const title = element("span", "page-title", page.label);
  if (page.href.replace(/\/$/, "") === location.pathname.replace(/\/$/, "")) {
    title.append(element("span", "here", "You are here"));
    link.setAttribute("aria-current", "page");
  }
  const arrow = element("span", "arrow", "↗");
  arrow.setAttribute("aria-hidden", "true");
  title.append(arrow);
  body.append(title, element("span", "page-path", page.href));
  if (page.description) body.append(element("span", "description", page.description));
  const status = recency(page);
  const meta = element("span", `page-meta ${status}`);
  const time = element("time", "", dateLabel(page));
  if (page.updatedAt) time.dateTime = page.updatedAt;
  meta.append(time);
  if (status !== "unknown") {
    meta.append(element("span", "status", { recent: "Recently worked", quiet: "Getting quiet", attention: "Needs attention" }[status]));
  }
  if (page.workingCopy) meta.append(element("span", "working", "Working copy"));
  const access = { owner: "Owner sign-in", staff: "Staff sign-in", development: "Local only", "site-gate": "Site access" }[page.access];
  if (access) meta.append(element("span", "access", access));
  body.append(meta);
  if (!page.thumbnail && ["owner", "staff"].includes(page.access)) body.append(element("span", "preview-note", "Sign in to view this page"));
  link.append(body);
  const control = element("label", "completion-control");
  const checkbox = element("input", "completion-checkbox");
  checkbox.type = "checkbox";
  checkbox.checked = completed.has(page.id);
  checkbox.setAttribute("aria-label", `Mark ${page.label} as done`);
  const label = element("span", "completion-label", checkbox.checked ? "Done" : "Mark as done");
  control.append(checkbox, label);
  checkbox.addEventListener("change", () => {
    card.dataset.done = String(checkbox.checked);
    label.textContent = checkbox.checked ? "Done" : "Mark as done";
    saveMark("pages", completionKey, page.id, checkbox.checked, page.label);
    completed = new Set(progress.pages);
  });
  card.append(link, control);
  return card;
}

function sortPages(items) {
  if (sort === "section") return items;
  return [...items].sort((a, b) => {
    const first = Date.parse(a.updatedAt);
    const second = Date.parse(b.updatedAt);
    if (!Number.isFinite(first)) return Number.isFinite(second) ? 1 : a.label.localeCompare(b.label);
    if (!Number.isFinite(second)) return -1;
    return (sort === "newest" ? second - first : first - second) || a.label.localeCompare(b.label);
  });
}

function countLabel(count) {
  const node = element("div", "count");
  node.append(element("span", "", String(count)), element("span", "", count === 1 ? "page" : "pages"));
  return node;
}

function content(items, grouped) {
  const body = element("div", "column-body");
  if (!items.length) {
    body.append(element("p", "empty", "No pages match this view."));
    return body;
  }
  if (sort !== "section" || !grouped) {
    sortPages(items).forEach(page => body.append(row(page)));
    return body;
  }
  const groups = new Map();
  items.forEach(page => {
    if (!groups.has(page.group)) groups.set(page.group, []);
    groups.get(page.group).push(page);
  });
  for (const [group, entries] of groups) {
    const section = element("section", "page-group");
    section.append(element("h3", "group-title", group));
    entries.forEach(page => section.append(row(page)));
    body.append(section);
  }
  return body;
}

function column(items, title, eyebrow, description, grouped = false) {
  const section = element("section", "column");
  const header = element("header", "column-head");
  header.append(element("p", "eyebrow", eyebrow));
  const heading = element("div", "column-title");
  heading.append(element("h2", "", title), countLabel(items.length));
  header.append(heading, element("p", "column-desc", description));
  section.append(header, content(items, grouped));
  return section;
}

function render() {
  if (!loaded) return;
  const query = search.value.trim().toLowerCase();
  const matching = pages.filter(page =>
    (activeFilter === "all" || recency(page) === activeFilter)
    && `${page.label} ${page.href} ${page.group} ${sections.find(section => section.key === sectionKey(page)).title} ${page.description ?? ""}`.toLowerCase().includes(query));
  resultCount.textContent = `${matching.length} of ${pages.length} pages`;
  for (const node of document.querySelectorAll("[data-count]")) {
    node.textContent = String(node.dataset.count === "all" ? pages.length : pages.filter(page=>recency(page)===node.dataset.count).length);
  }
  const fragment = document.createDocumentFragment();
  if (!matching.length) {
    const empty = element("div", "loading");
    empty.append(element("strong", "", "No pages in this view."), element("p", "", "Choose All or try another page name."));
    fragment.append(empty);
  } else {
    const columns = element("div", "columns");
    for (const section of sections) {
      const items = matching.filter(page => sectionKey(page) === section.key);
      if (items.length) columns.append(column(items, section.title, section.eyebrow, section.description, section.grouped));
    }
    fragment.append(columns);
  }
  directory.replaceChildren(fragment);
}

async function load() {
  directory.setAttribute("aria-busy", "true");
  try {
    await progressReady;
    const response = await fetch("/__dev/pages-data.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Directory unavailable");
    const data = await response.json();
    if (!Array.isArray(data.pages) || data.pages.some(page => !page.label || !page.href || !page.kind)) throw new Error("Invalid directory data");
    pages = data.pages;
    loaded = true;
    render();
  } catch {
    resultCount.textContent = "Directory unavailable";
    const error = element("div", "loading", "The local page directory could not load.");
    const retry = element("button", "retry", "Try again");
    retry.type = "button";
    retry.addEventListener("click", load);
    error.append(retry);
    directory.replaceChildren(error);
  } finally {
    directory.setAttribute("aria-busy", "false");
  }
}

document.querySelectorAll("[data-filter]").forEach(button => button.addEventListener("click", () => {
  activeFilter = button.dataset.filter;
  document.querySelectorAll("[data-filter]").forEach(item => item.setAttribute("aria-pressed", String(item === button)));
  render();
}));
document.querySelectorAll("[data-sort]").forEach(button => button.addEventListener("click", () => {
  sort = button.dataset.sort;
  document.querySelectorAll("[data-sort]").forEach(item => item.setAttribute("aria-pressed", String(item === button)));
  render();
}));
search.addEventListener("input", render);
if(checklistView) renderRoadmap(); else load();

function renderRoadmap() {
  const phases = [
    ["Foundation", "Agree on the story before polishing the pages.", [
      ["audience", "Define the audience and main customer problem", "Make the intended business types and single-location scope clear."],
      ["promise", "Confirm the headline and product promise", "Explain what the receptionist does in plain language.", "/"],
      ["scope", "Separate available features from future ideas", "Check that the site reflects what customers can use today.", "/features"],
      ["voice", "Agree on brand voice and visual direction", "Review the logo, character, typography and colours.", "/__dev/design-system"]]],
    ["Pages & content", "Build a complete, consistent marketing experience.", [
      ["home", "Review the marketing homepage", "Check the story, hero imagery and calls to action.", "/"],
      ["features", "Review features and product explanations", "Use clear examples and avoid repeated content.", "/features"],
      ["demos", "Review the demo experience", "Make it easy to understand and try the product.", "/demos"],
      ["responsive", "Check layouts on mobile and desktop", "Review spacing, navigation, images and readable text."]]],
    ["Plans & purchase", "Make the decision and purchase easy to understand.", [
      ["pricing", "Confirm plan prices and included usage", "Keep setup fees, recurring charges and optional extras clear.", "/#terms"],
      ["estimate", "Review the plan finder", "Check editable estimates, recommendations and the return to plans.", "/#terms"],
      ["checkout", "Review checkout and email verification", "Ask for minimal information and describe the secure link accurately.", "/start"],
      ["payment", "Test payment success, cancellation and failure", "Verify the receipt and the handoff into business setup.", "/account?preview=confirmation"],
      ["setup-v2", "Compare setup version 2 (Bubs interviews you)", "Same fields as the current setup, filled by conversation. Experiment for a side-by-side decision.", "/account/setup-v2"]]],
    ["Quality & trust", "Check the details that make the site dependable.", [
      ["accessibility", "Check keyboard access and contrast", "Review focus states, field labels, menus and error messages."],
      ["forms", "Test forms and saved progress", "Check validation, corrections, autosave and recovery."],
      ["links", "Check navigation and page links", "Make sure back links return to the expected section.", "/__dev/pages"],
      ["legal", "Review contact, privacy and terms", "Confirm the published details match the service being offered."]]],
    ["Launch", "Confirm readiness before making the site public.", [
      ["metadata", "Check search and sharing previews", "Review page titles, descriptions, share images and indexing."],
      ["performance", "Check loading speed and image sizes", "Try the key pages on a phone and a slower connection."],
      ["production", "Verify production services", "Confirm the domain, email delivery and payment configuration."],
      ["release", "Approve and verify the release", "After publishing, walk through the live customer journey."]]],
    ["After launch", "Keep improvements in the same plan.", [
      ["feedback", "Gather customer feedback", "Record confusing moments and recurring support questions."],
      ["conversion", "Review where visitors drop off", "Use the findings to prioritize page and checkout improvements."],
      ["content", "Add useful examples and proof", "Build content from real customer needs and approved stories."],
      ["future", "Prioritize the next features", "Keep future releases separate from promises on the current site.", "/features#coming-soon"]]],
  ];
  const key=roadmapKey;
  let done=new Set(localSet(key));
  const roadmapInputs=[];
  progressReady.then(()=>{done=new Set(progress.roadmap);roadmapInputs.forEach(([id,input])=>{input.checked=done.has(id);});update();});
  document.querySelector(".controls").hidden=true;
  document.querySelector(".meta").hidden=true;
  document.querySelector(".footnote").textContent="Completion is based on your review, not inferred from a page existing. Changes are saved to the workspace file (dev/progress.json) and travel with the repo. Page Index completion marks stay separate.";
  directory.setAttribute("aria-busy","false");
  const summary=element("section","roadmap-summary");
  const summaryText=element("strong");
  const overall=element("progress");overall.max=phases.flatMap(p=>p[2]).length;overall.setAttribute("aria-label","Overall marketing progress");
  summary.append(element("span","eyebrow","Marketing website"),summaryText,overall);
  const board=element("div","roadmap-layout");
  const rail=element("div","phase-rail");rail.setAttribute("role","tablist");rail.setAttribute("aria-label","Roadmap phases");rail.setAttribute("aria-orientation","vertical");
  const panels=element("div","phase-panels");board.append(rail,panels);
  const tabs=[];const phasePanels=[];
  const selectPhase=(selected,focus=false)=>{tabs.forEach((tab,i)=>{tab.setAttribute("aria-selected",String(i===selected));tab.tabIndex=i===selected?0:-1;phasePanels[i].hidden=i!==selected;});if(focus)tabs[selected].focus();};
  const updates=[];
  const update=()=>{const count=phases.flatMap(p=>p[2]).filter(t=>done.has(t[0])).length;summaryText.textContent=`${count} of ${overall.max} tasks complete`;overall.value=count;updates.forEach(fn=>fn());};
  phases.forEach(([title,description,tasks],index)=>{
    const tab=element("button","phase-tab");tab.type="button";tab.id=`phase-tab-${index}`;tab.setAttribute("role","tab");tab.setAttribute("aria-controls",`phase-panel-${index}`);
    const tabCount=element("small");tab.append(element("span","phase-number",String(index+1).padStart(2,"0")),element("strong","",title),tabCount);rail.append(tab);tabs.push(tab);
    tab.addEventListener("click",()=>selectPhase(index));
    tab.addEventListener("keydown",event=>{let next=index;if(event.key==="ArrowDown")next=(index+1)%phases.length;else if(event.key==="ArrowUp")next=(index+phases.length-1)%phases.length;else if(event.key==="Home")next=0;else if(event.key==="End")next=phases.length-1;else return;event.preventDefault();selectPhase(next,true);});
    const section=element("section","phase-card");section.id=`phase-panel-${index}`;section.setAttribute("role","tabpanel");section.setAttribute("aria-labelledby",tab.id);section.tabIndex=0;phasePanels.push(section);
    updates.push(()=>{tabCount.textContent=`${tasks.filter(t=>done.has(t[0])).length} / ${tasks.length}`;});
    const heading=element("header","phase-heading");
    const count=element("span","phase-count");
    heading.append(element("p","eyebrow",`Phase ${String(index+1).padStart(2,"0")}`),element("h2","",title),element("p","",description),count);
    const progress=element("progress");progress.max=tasks.length;progress.setAttribute("aria-label",`${title} progress`);heading.append(progress);section.append(heading);
    updates.push(()=>{const n=tasks.filter(t=>done.has(t[0])).length;count.textContent=`${n} / ${tasks.length} complete`;progress.value=n;section.dataset.complete=String(n===tasks.length);});
    tasks.forEach(([id,title,detail,href])=>{
      const row=element("div","roadmap-task");
      const label=element("label");const input=element("input","completion-checkbox");input.type="checkbox";input.checked=done.has(id);
      const text=element("span");text.append(element("strong","",title),element("small","",detail));label.append(input,text);row.append(label);
      if(href){const link=element("a","task-review","Review ↗");link.href=href;link.setAttribute("aria-label",`Review: ${title}`);row.append(link);}
      roadmapInputs.push([id,input]);
      input.addEventListener("change",()=>{saveMark("roadmap",key,id,input.checked,title);done=new Set(progress.roadmap);update();});
      section.append(row);
    });panels.append(section);
  });
  directory.replaceChildren(summary,board);update();selectPhase(0);
}
