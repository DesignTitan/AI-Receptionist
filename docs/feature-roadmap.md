# Public feature roadmap

Updated 10 September 2026.

The light Features page ends with **Coming soon** at `/features#coming-soon`. Visitors can upvote each item, remove their vote, sort by popularity, and suggest a feature. `/admin/roadmap` is the staff review queue, linked as **Ideas** in the staff header and **Feature suggestions** in the development page index.

## Catalogue and expectations

`src/lib/roadmap/catalogue.ts` is the canonical customer-facing list. Keep IDs stable when editing titles or descriptions so votes remain attached. Items removed from the catalogue become hidden; their voting history is retained. The board labels each item Pilot, Planned or Exploring and gives no release-date or future-pricing promises.

| Capability | Status | Planning evidence |
| --- | --- | --- |
| Incoming appointment booking, caller choice and answering schedules | Pilot | `docs/inbound-phone.md`; live carrier acceptance remains outstanding |
| Existing calendar / booking software connections | Planned | `docs/ROADMAP.md`, `docs/customer-platform.md` |
| Different availability for each team member | Planned | `docs/customer-platform.md` |
| Owner editing of team and booking hours | Planned | `docs/ROADMAP.md`; existing owner update restrictions |
| Service menus with different appointment lengths | Exploring | `docs/customer-platform.md`; demand-dependent services work |
| Multiple locations | Planned | `docs/ROADMAP.md` |
| Multiple phone lines | Planned | `docs/ROADMAP.md` |
| Scheduled appointment reminder calls | Exploring | `docs/ROADMAP.md` |
| Opted-in customer reengagement calls | Exploring | `docs/ROADMAP.md` |
| Complete appointment changes by phone | Exploring | Current staff-follow-up boundary in `docs/inbound-phone.md` |
| More complete guided activation | Planned | `docs/ROADMAP.md`, `docs/customer-platform.md` |
| Useful outgoing voicemail messages | Planned | `docs/ROADMAP.md`, `docs/omnidimension.md` |
| Referral rewards | Planned | `docs/ROADMAP.md`; reward terms remain undecided |

Already built functionality stays in the main feature stories. Internal release chores, old roadmap dates and superseded pricing are not marketed as future features. Community ideas do not become product commitments merely because staff approve them for voting.

## Voting and suggestions

- GET `/api/roadmap` establishes a random HttpOnly, SameSite=Lax browser cookie. Production uses Secure. Only its SHA-256 identifier is stored with votes, not a name, email or phone number.
- Votes are persisted as a unique feature/visitor pair. Saving the same desired state twice does not add a second vote. Counts and the selected state come from the server. This is browser-based voting, not identity verification: clearing cookies or using another browser permits another vote.
- Suggestions require a 5–100 character title and 20–600 character description. The form asks visitors to omit private information. Suggestions are private until review, duplicate titles are rejected, and each visitor is limited to three submissions in a rolling 24 hours. The limit is persisted but shares the browser-identity limitation above.
- Staff can approve or decline suggestions. Approval adds an **Exploring / Community suggestion** item; hiding it removes it from public listings and voting while preserving existing votes. Staff should check duplicate ideas and personal information before approving. The current review interface does not edit submitted text.
- Both write endpoints enforce the browser-facing origin and a bounded JSON request. Staff APIs also verify the existing signed staff session. React renders suggestions as text, not HTML. There are no automatic emails or outbound messages.
- If storage fails, the known roadmap remains readable with unavailable vote counts, disabled actions and a retry control. An uncertain vote must be reloaded before another change.

## Storage and release

Development/test always use a durable SQLite file, `.local/roadmap.sqlite`, ignored by Git. This keeps local review independent of live customer feedback even when Supabase environment variables exist. The public preview explicitly says feedback is saved on this Mac. SQLite uses the tested Node 24 runtime; ordinary application bookings retain their existing storage behavior.

Production uses Supabase through the existing server-side service client. It has **no local or in-memory fallback**. Apply `supabase/migrations/20260910_feature_roadmap.sql` to the target database before deploying this feature. The migration creates three tables and service-role-only functions, enables RLS, and revokes direct anonymous/authenticated access. Existing production Supabase URL and service-role credentials are required; no credentials go into the browser.

The migration has been tested in an isolated PostgreSQL fixture. It has **not** been applied to the live Supabase project in this work block, and this feature has **not** been deployed. Local preview feedback is not automatically transferred to production. The production build can complete without database credentials; runtime storage failures use the unavailable state described above.

## Verification

`node --test tests/roadmap-request.test.ts tests/roadmap-store.test.ts tests/dev-preview.test.ts` checks bounded requests, origin handling (including Next's localhost URL normalization), vote idempotency, persistent state across instances, actual parallel processes, moderation visibility, duplicate prevention, suggestion limits and the development catalogue. An isolated PostgreSQL fixture also verified migration application, concurrent vote/submission behavior and service-role access restrictions.
