// Served only by scripts/dev.mjs. Shared by Next pages and standalone design studies.
// Keep this file out of public/: production has neither its route nor its mount.

(() => {
  // Keep in sync with dev/sites.mjs
  const STAGING_PREVIEW_URL = "https://ai-receptionist-git-codex-account-au-5528bb-bubs-1063s-projects.vercel.app";
  if (customElements.get("ai-dev-toolbar")) return;
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
      this.shadowRoot.innerHTML = `
        <style>
          :host{display:block;height:40px;position:relative;z-index:2147483000;color-scheme:dark;font:14px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#fff7eb;text-align:left;letter-spacing:normal}
          *{box-sizing:border-box} [hidden]{display:none!important}
          button,input,a{font:inherit} button,a{touch-action:manipulation;-webkit-tap-highlight-color:transparent}
          button{color:inherit;cursor:pointer} a{color:inherit;text-decoration:none}
          button:focus-visible,a:focus-visible,input:focus-visible{outline:2px solid #ffd49c;outline-offset:3px}
          .bar{position:fixed;inset:0 0 auto;height:40px;display:flex;align-items:center;gap:8px;padding:4px 12px;background:#85451f;border-bottom:1px solid #b87539;box-shadow:0 1px 0 #0004}
          .badge{display:flex;align-items:center;padding:0 4px;font-size:9px;letter-spacing:.06em;font-weight:650;flex:none;white-space:nowrap;color:#f7e5ce}
          .index{display:flex;align-items:center;gap:7px;height:30px;padding:0 10px;border:1px solid #ffffff16;border-radius:8px;background:#ffffff10;white-space:nowrap;font-size:12px}.index:hover{background:#ffffff25}.index[aria-current="page"]{background:#a65a26;border-color:#efb36e}
          .local{font-size:10px;letter-spacing:.1em;font-weight:650;color:#f8e6cc;white-space:nowrap;display:flex;align-items:center;gap:7px;margin-left:auto}
          .local::before{content:"";width:5px;height:5px;background:#e8b97c;border-radius:50%}
          .tool-links{display:flex;gap:3px;align-items:center;overflow-x:auto;min-width:0;scrollbar-width:none}.tool-links a{flex:none;font-size:12px;padding:7px 9px;border-radius:5px;white-space:nowrap}.tool-links a:hover{background:#ffffff20}.tool-links a[aria-current=page]{background:#a65a26}.menu{position:relative;flex:none}.menu summary{list-style:none;cursor:pointer;font-size:12px;padding:7px 9px;border-radius:5px;white-space:nowrap;display:flex;gap:6px;align-items:center}.menu summary::-webkit-details-marker{display:none}.menu summary:hover,.menu[open] summary{background:#ffffff20}.menu[aria-current=page] summary{background:#a65a26}.menu-list{position:fixed;top:var(--menu-top,44px);left:var(--menu-left,0);min-width:250px;display:grid;padding:6px;background:#6e3716;border:1px solid #b87539;border-radius:10px;box-shadow:0 12px 30px -10px #0008}.menu-list a{font-size:12px;padding:8px 10px;border-radius:6px;white-space:nowrap}.menu-list a:hover{background:#ffffff20}.menu-list a[aria-current=page]{background:#a65a26}.local{flex:none}@media(max-width:1100px){.local{display:none}.index{margin-left:0}.tool-links{flex:1}}@media(max-width:580px){.badge{display:none}.bar{gap:4px}.tool-links a{font-size:11px;padding-inline:8px}.index{font-size:11px;padding-inline:7px}}
        </style>
        <nav class="bar" aria-label="Development navigation">
          <div class="badge">Internal tools</div>
          <a class="index" href="/">Marketing homepage <span aria-hidden="true">↗</span></a>
          <div class="tool-links">
            <a href="/__dev/ops">Internal Ops</a><a href="/__dev/pages">Page index</a><a href="${STAGING_PREVIEW_URL}" target="_blank" rel="noopener noreferrer">Staging ↗</a><a href="/account?preview=confirmation">Application</a><a href="/account/setup-v2">Setup v2</a><a href="/__dev/design-system">Visual design system</a><a href="/__dev/design/campaign-v4/">Images & videos</a><details class="menu"><summary>Roadmap <span aria-hidden="true">▾</span></summary><div class="menu-list"><a href="/__dev/pages?view=roadmap">Marketing roadmap</a><a href="https://claude.ai/code/artifact/0a4ee2ad-e2b2-4998-9a5d-796e3097cd1a" target="_blank" rel="noopener noreferrer">Receptionist Launch Roadmap ↗</a><a href="https://claude.ai/code/artifact/631ce6b1-a6d1-46aa-a3dd-f00f83425a49" target="_blank" rel="noopener noreferrer">Receptionist Runbook ↗</a><a href="https://claude.ai/code/artifact/2d6057be-84b8-4ae8-8239-cc29a19859e3" target="_blank" rel="noopener noreferrer">Receptionist Unit Economics ↗</a></div></details><a href="/__dev/journey">User journey</a>
          </div>
          <span class="local">LOCAL ONLY</span>
        </nav>`;
      this.updateLocation();
      listen(window, "popstate", () => this.updateLocation());
      // the link strip scrolls horizontally, which also clips anything hanging below it,
      // so the open menu is positioned fixed, just under its summary
      for (const menu of this.shadowRoot.querySelectorAll("details.menu")) {
        listen(menu, "toggle", () => {
          if (!menu.open) return;
          const r = menu.querySelector("summary").getBoundingClientRect();
          menu.style.setProperty("--menu-top", `${Math.round(r.bottom + 6)}px`);
          menu.style.setProperty("--menu-left", `${Math.round(r.left)}px`);
        });
      }
      // the Roadmap menu closes on a click elsewhere or on Escape
      listen(document, "pointerdown", (event) => { const open = this.shadowRoot.querySelector(".menu[open]"); if (open && !event.composedPath().includes(open)) open.removeAttribute("open"); });
      listen(document, "keydown", (event) => { if (event.key === "Escape") this.shadowRoot.querySelector(".menu[open]")?.removeAttribute("open"); });
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
      if (this.shadowRoot.querySelector(".bar")) this.updateLocation();
    }

    updateLocation() {
      // Do not define a `pathname` property: React 19 would assign to it instead
      // of updating the observed attribute during client-side navigation.
      this.currentPathname = this.getAttribute("pathname") || location.pathname;
      const normalize = (path) => path.replace(/\/$/, "") || "/";
      const roadmap = ["roadmap", "checklist"].includes(new URLSearchParams(location.search).get("view"));
      // the Roadmap menu lights up when any of its pages is the current one
      const menu = this.shadowRoot.querySelector(".menu");
      if (menu) menu.removeAttribute("aria-current");
      for (const link of this.shadowRoot.querySelectorAll(".index,.tool-links a")) {
        const url = new URL(link.href, location.origin);
        const samePath = normalize(url.pathname) === normalize(this.currentPathname);
        const selected = samePath && (url.pathname === "/__dev/pages" ? Boolean(url.search) === roadmap : true);
        if (selected) link.setAttribute("aria-current", "page"); else link.removeAttribute("aria-current");
        if (selected && menu && menu.contains(link)) menu.setAttribute("aria-current", "page");
      }
    }
  }

  customElements.define("ai-dev-toolbar", DevelopmentToolbar);
})();
