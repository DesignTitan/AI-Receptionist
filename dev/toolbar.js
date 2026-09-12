// Served only by scripts/dev.mjs. Shared by Next pages and standalone design studies.
// Keep this file out of public/: production has neither its route nor its mount.

(() => {
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
          .tool-links{display:flex;gap:3px;align-items:center;overflow-x:auto;min-width:0;scrollbar-width:none}.tool-links a{flex:none;font-size:12px;padding:7px 9px;border-radius:5px;white-space:nowrap}.tool-links a:hover{background:#ffffff20}.tool-links a[aria-current=page]{background:#a65a26}.local{flex:none}@media(max-width:1100px){.local{display:none}.index{margin-left:0}.tool-links{flex:1}}@media(max-width:580px){.badge{display:none}.bar{gap:4px}.tool-links a{font-size:11px;padding-inline:8px}.index{font-size:11px;padding-inline:7px}}
        </style>
        <nav class="bar" aria-label="Development navigation">
          <div class="badge">Internal tools</div>
          <a class="index" href="/__dev/pages">Page index <span aria-hidden="true">↗</span></a>
          <div class="tool-links">
            <a href="/">Marketing website</a><a href="/account?preview=confirmation">Application</a><a href="/__dev/design-system">Visual design system</a><a href="/__dev/design/campaign-v4/">Images & videos</a><a href="/__dev/pages?view=roadmap">Roadmap</a><a href="/__dev/journey">User journey</a>
          </div>
          <span class="local">LOCAL ONLY</span>
        </nav>`;
      this.updateLocation();
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
      if (this.shadowRoot.querySelector(".bar")) this.updateLocation();
    }

    updateLocation() {
      // Do not define a `pathname` property: React 19 would assign to it instead
      // of updating the observed attribute during client-side navigation.
      this.currentPathname = this.getAttribute("pathname") || location.pathname;
      const normalize = (path) => path.replace(/\/$/, "") || "/";
      const roadmap = ["roadmap", "checklist"].includes(new URLSearchParams(location.search).get("view"));
      for (const link of this.shadowRoot.querySelectorAll(".index,.tool-links a")) {
        const url = new URL(link.href, location.origin);
        const samePath = normalize(url.pathname) === normalize(this.currentPathname);
        const selected = samePath && (url.pathname === "/__dev/pages" ? Boolean(url.search) === roadmap : true);
        if (selected) link.setAttribute("aria-current", "page"); else link.removeAttribute("aria-current");
      }
    }
  }

  customElements.define("ai-dev-toolbar", DevelopmentToolbar);
})();
