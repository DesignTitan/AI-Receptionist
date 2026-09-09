const directory = document.querySelector("#directory");
const search = document.querySelector(".search");
const resultCount = document.querySelector("#results-count");
let pages = [];
let activeFilter = "all";
let sort = "section";
let loaded = false;
const sections = [
  { key: "application", title: "Application", eyebrow: "Customer & staff workspace", description: "Accounts, bookings, business demos and staff tools. Sign-in still applies.", grouped: true },
  { key: "marketing", title: "Marketing Site", eyebrow: "The public-facing product", description: "The original marketing site, product overview, pricing and demo directory." },
  { key: "study", title: "Design Studies", eyebrow: "Drafts & experiments", description: "Visual directions and imagery to review alongside the original site." },
  { key: "internal", title: "Internal Tools", eyebrow: "Workspace utilities", description: "The page index, user journey and access tools. Each page shows its access requirements." },
];

function sectionKey(page) {
  if (page.kind === "internal" || page.group === "Internal tools") return "internal";
  if (page.kind === "study") return "study";
  if (page.group === "Marketing") return "marketing";
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
  const link = element("a", "page-row");
  link.href = page.href;
  const title = element("span", "page-title", page.label);
  if (page.href.replace(/\/$/, "") === location.pathname.replace(/\/$/, "")) {
    title.append(element("span", "here", "You are here"));
    link.setAttribute("aria-current", "page");
  }
  const arrow = element("span", "arrow", "↗");
  arrow.setAttribute("aria-hidden", "true");
  title.append(arrow);
  link.append(title, element("span", "page-path", page.href));
  if (page.description) link.append(element("span", "description", page.description));
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
  link.append(meta);
  return link;
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
load();
