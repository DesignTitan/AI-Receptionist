# Local page navigation

Run `npm run dev` and open the local URL printed by Next. The burgundy DEV bar
offers a searchable Pages dropdown, the current page, and a local path field.
Command/Ctrl K opens the dropdown; arrow keys move through results; Escape closes it.

The menu includes the original marketing site, customer and staff screens,
three business demos and booking pages, plus all three design studies. Staff
and customer pages keep their normal sign-in requirements. Individual records
and confirmation pages are reached through their lists and booking flows.

The **Page index** link beside the dropdown opens `/__dev/pages`. This full
directory groups internal tools, application pages and design studies, with
search, recency filters and newest/oldest sorting. Both navigation views use
`dev/page-catalogue.mjs` so their destinations stay consistent. Source dates
come from Git history and uncommitted file edits, and refresh on page reload.
They describe the listed source files, not a deployment or a health check.

The design studies are served from `design/hero-comparison` without editing
them. The current comparison is `/__dev/design/luxury-v2`; the original site is
still `/`. The same toolbar appears on both. In single-tenant mode the business
and booking links use that tenant's routes.

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
