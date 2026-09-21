# Private tester access

The public site at https://bubs.ai/ shows the coming-soon page. Share https://bubs.ai/login?next=%2Fhome and the separately supplied preview password with testers.

The shared site password unlocks marketing and testing pages for seven days. It does not grant a customer session or staff access. Account, payment and voice setup requirements still apply; unlocking the website does not activate those services.

Production and Preview use `COMING_SOON=true`, `SITE_GATE=locked` and the owner-selected `SITE_PASSWORD`. Environment changes apply to new deployments. The local preview uses the same settings in its untracked environment file. Changing the password and redeploying invalidates previous site cookies.

Private pages send no-index headers and the private-mode robots policy allows only the splash page. Private images bypass optimization and pass through the site gate. Required splash images/fonts, framework assets, waitlist signup, bot verification and independently authenticated provider/job endpoints remain available. Search-engine instructions are not access controls and cannot erase content previously copied or indexed.

Validation: `PREVIEW_TEST_ORIGIN=<origin> PREVIEW_TEST_PASSWORD=<password> node tests/private-preview-browser.mjs`. Run against a built release; development mode replaces cache headers. The checks do not send emails, place calls or charge cards.

Jev: the requested `jev-codex` launcher was verified with `--help`. Automatic approval review rejected the earlier external security-assessment payload. No security details were sent; permission to send those details remains pending.
