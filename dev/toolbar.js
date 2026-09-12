// Served only by scripts/dev.mjs. Shared by Next pages and standalone design studies.
// Keep this file out of public/: production has neither its route nor its mount.
import { getPages } from "/__dev/page-catalogue.mjs";

(() => {
  if (customElements.get("ai-dev-toolbar")) return;
  const listIcon = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 5h10M7 10h10M7 15h10M3 5h.01M3 10h.01M3 15h.01"/></svg>';
  const chevron = '<svg class="chevron" viewBox="0 0 20 20" aria-hidden="true"><path d="m6 8 4 4 4-4"/></svg>';

  class DevelopmentToolbar extends HTMLElement {
    static observedAttributes = ["pathname"];

    constructor() {
      super();
      this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
      document.documentElement.style.setProperty("--workspace-top-offset", "40px");
      this.events?.abort();
      this.events = new AbortController();
      const listen = (target, event, callback) => target.addEventListener(event, callback, { signal: this.events.signal });
      const groups = new Map();
      for (const page of getPages({ tenant: this.getAttribute("tenant") || "", siteGate: this.getAttribute("site-gate") || "public" })) {
        if (!groups.has(page.group)) groups.set(page.group, []);
        groups.get(page.group).push([page.label, page.href]);
      }
      this.groups = [...groups];

      this.shadowRoot.innerHTML = `
        <style>
          :host{display:block;height:40px;position:relative;z-index:2147483000;color-scheme:dark;font:14px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#fff7eb;text-align:left;letter-spacing:normal}
          *{box-sizing:border-box} [hidden]{display:none!important}
          button,input,a{font:inherit} button,a{touch-action:manipulation;-webkit-tap-highlight-color:transparent}
          button{color:inherit;cursor:pointer} a{color:inherit;text-decoration:none}
          button:focus-visible,a:focus-visible,input:focus-visible{outline:2px solid #ffd49c;outline-offset:3px}
          svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;flex:none}
          .bar{position:fixed;inset:0 0 auto;height:40px;display:flex;align-items:center;gap:8px;padding:4px 12px;background:#85451f;border-bottom:1px solid #b87539;box-shadow:0 1px 0 #0004}
          .badge{display:flex;align-items:center;padding:0 4px;font-size:9px;letter-spacing:.06em;font-weight:650;flex:none;white-space:nowrap;color:#f7e5ce}
          .pages{display:flex;align-items:center;gap:8px;height:30px;padding:0 10px;border:1px solid #ffffff16;border-radius:8px;background:#ffffff17;white-space:nowrap}
          .pages:hover{background:#ffffff28}.pages[aria-expanded="true"]{background:#a65a26;border-color:#efb36e}
          .index{display:flex;align-items:center;gap:7px;height:30px;padding:0 10px;border:1px solid #ffffff16;border-radius:8px;background:#ffffff10;white-space:nowrap;font-size:12px}.index:hover{background:#ffffff25}.index[aria-current="page"]{background:#a65a26;border-color:#efb36e}
          .chevron{width:15px;height:15px;margin-left:5px}.pages[aria-expanded="true"] .chevron{transform:rotate(180deg)}
          .current{display:flex;align-items:center;gap:10px;min-width:0;margin-left:9px;font-size:12px;color:#f1dcc1}
          .current::before{content:"";width:1px;height:18px;background:#ffffff26;margin-right:7px}
          .current-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
          .local{font-size:10px;letter-spacing:.1em;font-weight:650;color:#f8e6cc;white-space:nowrap;display:flex;align-items:center;gap:7px;margin-left:auto}
          .local::before{content:"";width:5px;height:5px;background:#e8b97c;border-radius:50%}
          .shortcut{border:0;background:none;color:#f0cf9e;font-size:12px;padding:8px 2px 8px 6px}
          .panel{position:fixed;top:47px;left:104px;width:430px;max-width:calc(100vw - 24px);max-height:calc(100dvh - 60px);display:flex;flex-direction:column;overflow:hidden;border:1px solid #926038;border-radius:12px;background:#302014;box-shadow:0 18px 60px #160b0266}
          .search-wrap{padding:15px 15px 12px;border-bottom:1px solid #ffffff10;flex:none}
          .panel-heading{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;font-size:12px;font-weight:650}
          .total{color:#d8b995;font-size:11px;font-weight:400}
          .search{display:block;width:100%;height:39px;border-radius:6px;border:1px solid #9b754f;background:#ffffff07;color:#fff7eb;padding:0 11px;font-size:13px}
          .results{overflow:auto;overscroll-behavior:contain;padding:5px 8px 10px;min-height:0;max-height:520px;scrollbar-width:thin;scrollbar-color:#956236 transparent}
          .group h3{font-size:10px;font-weight:650;letter-spacing:.1em;text-transform:uppercase;color:#dec09b;margin:14px 9px 6px;line-height:1.5}
          .page-link{display:flex;align-items:center;gap:12px;min-height:49px;border-radius:6px;padding:8px 10px;margin:2px 0;position:relative}
          .page-link:hover,.page-link:focus-visible{background:#ffffff0d}
          .page-link[aria-current="page"]{background:#85451f66}
          .page-link>span:first-child{display:flex;flex-direction:column;min-width:0;gap:3px}
          .page-title{font-size:13px;font-weight:500;line-height:1.3}
          .path{font-size:10px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:#d0b99d;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
          .marker{margin-left:auto;color:#ffd49c;font-size:10px;flex:none}
          .page-link:not([aria-current="page"]) .marker{display:none}
          .empty{font-size:13px;color:#e2cbb0;padding:22px 10px;margin:0}
          .footer{border-top:1px solid #ffffff10;padding:11px 16px;font-size:10px;color:#d8b995;flex:none;display:flex;justify-content:space-between;gap:10px}
          @media(max-width:850px){.current{display:none}.panel{left:16px}.local{margin-left:auto}}
          @media(max-width:580px){.bar{gap:8px;padding-inline:10px}.badge{padding-inline:9px}.pages{padding-inline:10px}.panel{left:12px;width:430px}.local{font-size:9px;letter-spacing:.06em}.shortcut{padding-left:3px}.footer{font-size:9px}}
          @media(max-width:680px){.local{display:none}.index{margin-left:auto}} @media(max-width:380px){.shortcut{display:none}.index{padding-inline:9px}.bar{gap:6px}}
          .tool-links{display:flex;gap:3px;align-items:center;overflow-x:auto;min-width:0;scrollbar-width:none}.tool-links a{flex:none;font-size:12px;padding:7px 9px;border-radius:5px;white-space:nowrap}.tool-links a:hover{background:#ffffff20}.tool-links a[aria-current=page]{background:#a65a26}.local{flex:none}@media(max-width:1100px){.local,.shortcut{display:none}.index{margin-left:0}.tool-links{flex:1}}@media(max-width:580px){.badge{display:none}.bar{gap:4px}.tool-links a{font-size:11px;padding-inline:8px}.index{font-size:11px;padding-inline:7px}.pages{font-size:11px}}
        </style>
        <nav class="bar" aria-label="Development navigation">
          <div class="badge">Internal tools</div>
          <button class="pages" type="button" aria-expanded="false" aria-controls="dev-pages">${listIcon} Pages ${chevron}</button>
          <a class="index" href="/__dev/pages">Page index <span aria-hidden="true">↗</span></a>
          <div class="tool-links">
            <a href="/">Marketing website</a><a href="/account?preview=confirmation">Application</a><a href="/__dev/design-system">Visual design system</a><a href="/__dev/design/campaign-v4/">Images & videos</a><a href="/__dev/pages?view=roadmap">Roadmap</a><a href="/__dev/journey">User journey</a>
          </div><div class="current" hidden><span class="current-name"></span></div>
          <span class="local">LOCAL ONLY</span>
          <button class="shortcut" type="button" aria-label="Find a page" title="Find a page (Command or Control K)">⌘K</button>
        </nav>
        <section id="dev-pages" class="panel" aria-label="Pages" hidden>
          <div class="search-wrap">
            <div class="panel-heading">Jump to a page <span class="total" aria-live="polite"></span></div>
            <input class="search" type="search" aria-label="Search pages" placeholder="Search pages or paths…" autocomplete="off" spellcheck="false">
          </div>
          <div class="results"></div>
          <div class="footer"><span>↑ ↓ move · Enter open · Esc close</span><span>Development only</span></div>
        </section>`;

      this.panel = this.shadowRoot.querySelector(".panel");
      this.trigger = this.shadowRoot.querySelector(".pages");
      this.search = this.shadowRoot.querySelector(".search");
      this.results = this.shadowRoot.querySelector(".results");
      this.updateLocation();
      listen(this.trigger, "click", () => this.setOpen(this.panel.hidden));
      listen(this.shadowRoot.querySelector(".shortcut"), "click", () => this.setOpen(true));
      listen(this.search, "input", () => this.renderPages());
      listen(this.results, "click", (event) => { if (event.target.closest("a")) this.setOpen(false); });
      listen(document, "pointerdown", (event) => { if (!event.composedPath().includes(this)) this.setOpen(false); });
      listen(this.shadowRoot, "focusout", () => {
        // Let the browser finish transferring focus before checking it. A microtask
        // can run between blur and focus and hide a link before its mouse click.
        setTimeout(() => { if (this.isConnected && !this.shadowRoot.activeElement) this.setOpen(false); }, 0);
      });
      listen(document, "keydown", (event) => {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
          event.preventDefault();
          this.setOpen(this.panel.hidden, true);
        } else if (event.key === "Escape" && !this.panel.hidden) {
          event.preventDefault();
          event.stopPropagation();
          this.setOpen(false, true);
        }
      });
      listen(this.panel, "keydown", (event) => {
        const links = [...this.results.querySelectorAll("a")];
        const active = this.shadowRoot.activeElement;
        const index = links.indexOf(active);
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          const next = index < 0 ? (event.key === "ArrowDown" ? 0 : links.length - 1)
            : (index + (event.key === "ArrowDown" ? 1 : -1) + links.length) % links.length;
          links[next]?.focus();
        } else if (index >= 0 && (event.key === "Home" || event.key === "End")) {
          event.preventDefault();
          links[event.key === "Home" ? 0 : links.length - 1]?.focus();
        } else if (event.key === "Enter" && active === this.search && !event.isComposing) {
          event.preventDefault();
          links[0]?.click();
        }
      });
      listen(window, "popstate", () => this.updateLocation());
      listen(window, "hashchange", () => this.updateLocation());
      // Keep fixed/sticky site navigation below the dev bar without changing site CSS.
      this.offsets = document.createElement("style");
      this.offsets.textContent = `html{scroll-padding-top:60px!important} .rc-nav{top:calc(var(--nav-top) + 40px)!important} header.sticky.top-0,.control-bar{top:40px!important} .platform-aside{top:64px!important} body>a.sr-only:focus,.skip:focus,.skip-link:focus{top:50px!important}`;
      document.head.append(this.offsets);
    }

    disconnectedCallback() {
      document.documentElement.style.removeProperty("--workspace-top-offset");
      this.events?.abort();
      this.offsets?.remove();
    }

    attributeChangedCallback() {
      if (this.results) this.updateLocation();
    }

    updateLocation() {
      // Do not define a `pathname` property: React 19 would assign to it instead
      // of updating the observed attribute during client-side navigation.
      this.currentPathname = this.getAttribute("pathname") || location.pathname;
      const normalize = (path) => path.replace(/\/$/, "") || "/";
      const current = this.groups.flatMap(([, pages]) => pages).find(([, href]) => normalize(href) === normalize(this.currentPathname));
      this.shadowRoot.querySelector(".current-name").textContent = current?.[0] || this.currentPathname;
      this.shadowRoot.querySelector(".current-name").title = this.currentPathname;
      const roadmap = ["roadmap", "checklist"].includes(new URLSearchParams(location.search).get("view"));
      for (const link of this.shadowRoot.querySelectorAll(".index,.tool-links a")) {
        const url = new URL(link.href, location.origin);
        const samePath = normalize(url.pathname) === normalize(this.currentPathname);
        const selected = samePath && (url.pathname === "/__dev/pages" ? Boolean(url.search) === roadmap : true);
        if (selected) link.setAttribute("aria-current", "page"); else link.removeAttribute("aria-current");
      }
      this.setOpen(false);
      this.renderPages();
    }

    setOpen(open, restoreFocus = false) {
      this.panel.hidden = !open;
      this.trigger.setAttribute("aria-expanded", String(open));
      if (open) {
        this.search.value = "";
        this.renderPages();
        this.search.focus();
      } else if (restoreFocus) this.trigger.focus();
    }

    renderPages() {
      const query = this.search.value.trim().toLowerCase();
      const fragment = document.createDocumentFragment();
      let count = 0;
      for (const [category, pages] of this.groups) {
        const matches = pages.filter(([label, href]) => `${category} ${label} ${href}`.toLowerCase().includes(query));
        if (!matches.length) continue;
        const group = document.createElement("div");
        group.className = "group";
        const title = document.createElement("h3");
        title.textContent = category;
        group.append(title);
        for (const [label, href] of matches) {
          const link = document.createElement("a");
          link.href = href;
          link.className = "page-link";
          if ((href.replace(/\/$/, "") || "/") === (this.currentPathname.replace(/\/$/, "") || "/")) link.setAttribute("aria-current", "page");
          const text = document.createElement("span");
          const name = document.createElement("span");
          name.className = "page-title";
          name.textContent = label;
          const path = document.createElement("span");
          path.className = "path";
          path.textContent = href;
          const marker = document.createElement("span");
          marker.className = "marker";
          marker.textContent = "You are here";
          text.append(name, path);
          link.append(text, marker);
          group.append(link);
          count++;
        }
        fragment.append(group);
      }
      if (!count) {
        const empty = document.createElement("p");
        empty.className = "empty";
        empty.textContent = "No pages found. Try another name or path.";
        fragment.append(empty);
      }
      this.results.replaceChildren(fragment);
      this.shadowRoot.querySelector(".total").textContent = `${count} ${count === 1 ? "page" : "pages"}`;
    }
  }

  customElements.define("ai-dev-toolbar", DevelopmentToolbar);
})();
