# Local page navigation

Use the existing workspace preview at http://127.0.0.1:3101. Run `npm run dev:workspace:status` to check it, or `npm run dev:workspace` if it is not running. The in-app preview attaches to this service; do not start a competing Next server in the same directory.

The compact burnt-amber **Internal tools** bar links to Page index, Marketing website, Application, Visual design system, Images & videos, Roadmap and User journey. The old Pages dropdown, path field and Command/Ctrl K shortcut have been removed. The page index is the complete directory.

## Page index and roadmap

`/__dev/pages` groups screenshot cards into Application, Marketing Site, Design Studies and Internal Tools. Marketing Site includes the homepage, Features & benefits, Explore demos and Images & videos. Individual business and booking demos stay in Application. Customer and staff screens retain their sign-in requirements.

The index reads `dev/page-catalogue.mjs`, with search, recency filters and sorting. Source dates come from Git history and working-copy edits, refreshed on reload; they are not deployment dates or health checks. Marketing V2 has been removed; shared imagery remains available to pages that use it.

`/__dev/pages?view=roadmap` combines the marketing roadmap and checklist: phases on the left, selected phase tasks on the right. The older `?view=checklist` URL opens the same view. Task completion is stored per browser under `ai-receptionist-marketing-roadmap-v1`, separately from page completion.

`/__dev/design-system` documents the current brand and components. `/__dev/design/campaign-v4/` is the Images & videos canvas. The original studies remain under `design/hero-comparison`. These internal views and local account previews are excluded from production.

## Production exclusion

- `next.config.ts` resolves `@development-tools` to the real mount only during
  the development-server phase, with the local preview server running.
- Build/start resolve it to an empty server component, for both Turbopack and
  Webpack. The toolbar script, route catalogue and styling are outside `public`.
- `scripts/dev.mjs` alone starts the loopback-only preview server. Its
  `/__dev` rewrite does not exist in production. Direct `next dev` skips these
  tools; use the project's `npm run dev` command.
- The preview server serves only supported static files; it does not expose
  directory listings, credentials, or symlinks outside the studies. Only the
  two existing study-note JSON files are allowed under their docs folders.

Every `npm run build` checks the generated client/server assets and route manifest
and fails if the toolbar or preview rewrite leaked into production. After changing
this boundary, also test production using `npm start`.

## Visual page board

The index uses rounded screenshot cards in a responsive, 1,600px-wide board. Regenerate public-page first-screen captures with `node scripts/capture-page-previews.mjs` while the local server runs on port 3101. Captures live in `dev/thumbnails`, served only through the development preview. The capture process uses an anonymous browser and skips redirects, unavailable pages and private owner/staff pages. It does not submit forms or create accounts. Screenshots indicate a saved preview, not a claim that a page is production-ready.

Each card has a manual completion checkbox. Choices are stored in this browser’s localStorage (`ai-receptionist-page-completion-v1`), independently of source-edit dates. They can be unchecked and are not synced to other browsers.
