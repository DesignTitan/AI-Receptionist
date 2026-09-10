# Make room for your day — campaign photographs

Commissioned 10 September 2026 through Higgsfield. Bubs requested the complete still-image set in the clean, spacious, realistic direction of the approved V2 opening. This supersedes the earlier still-production deferral. Video and final marketing-page assembly remain separate steps.

Review at `http://127.0.0.1:3101/__dev/design/campaign-v4`. The gallery is also under **Marketing Site → Marketing campaign images** in the development page index and toolbar. It displays square compositions without cropping, with links to the original PNGs.

## The collection

| File stem | Human situation | Product evidence to pair with it |
| --- | --- | --- |
| `01-full-attention` | Stylist absorbed in serving a client | An agreed appointment and saved call result |
| `02-busy-reception` | Checkout, arrival and staff already occupied | Caller choice and the booking route |
| `03-away-from-desk` | Owner leaves reception to help a client | The owner's saved answering choice |
| `04-proper-break` | A genuine short break in the salon courtyard | Temporary answering that returns to the schedule |
| `05-time-off` | Owner and companion beside Lake Michigan | Vacation dates and future appointment availability |
| `06-after-hours` | Closing the salon at dusk | Online booking after hours; phone answering after acceptance |
| `07-customer-call` | A customer making an ordinary call from home | A separate incoming-booking pilot demonstration |
| `08-online-booking` | A customer choosing a time online | Online booking, optional outgoing confirmation and its outcome |
| `09-owner-review` | Owner checking what happened | A confirmed booking and a request needing a person |
| `10-phone-evolution` | Rotary phone, cordless landline, smartphone | A short optional transition into software, not new hardware |

The six owner situations lead. Customer and owner-record scenes explain the work behind the benefit. Phone evolution is a supporting option; it does not replace the human campaign with the previously rejected technical concepts.

## Direction and provenance

- Original fictional people and a fictional salon; these images do not portray or testify for Tanaz staff or an actual customer.
- Natural light, ivory, charcoal, dark oak and stone. The reference is photographic scale, clarity and restraint, not spacecraft, robots or glowing interfaces.
- The existing approved coastal image remains unchanged at `../luxury-v2/assets/05-time-back.png`. It is shown separately as an existing anchor and was not generated through Higgsfield in this task.
- Cinema Studio Image 2.5 generated the first service image and optional phone study. Its eight reference-input requests failed without useful provider explanations. The service image was then used as the visual reference with GPT Image 2, high quality, **through Higgsfield**, to carry the owner and salon through the other scenes.
- `requests.json` preserves the initial intended requests; `generation-attempts.json` records the first submissions and failures. `final-requests.json` contains the selected requests and job IDs. The final asset manifest records actual dimensions and checksums; requested resolution is not a claim about delivered pixel dimensions.
- PNG originals are untouched. Lighter WebP display copies are made in Higgsfield's cloud sandbox with aspect ratio preserved. They are display derivatives, not additional generated compositions.

## Placement and review

Keep product text in HTML or verified application captures alongside the photographs. Incoming phone booking is still a pilot preview awaiting a tested connection. Online booking and optional outgoing confirmation are a distinct sequence. Usage limits, caller menus, schedule settings and connection status require readable product evidence; no photo demonstrates that a line is connected.

Review the collection as square stills before selecting final desktop and mobile placements. Some scenes will need separately composed wide or portrait variants; do not assume every square can crop into a hero. Preserve the original marketing site and current V2 while this image set is reviewed.

## Delivery and verification

All ten selected jobs completed and their PNG originals are saved. The two Cinema Studio images are 4096 × 4096; the eight GPT Image 2 outputs are 2880 × 2880 despite the requested `4k` setting. All display copies are 2048 × 2048 WebP, totaling 3,064,482 bytes. No upscaling or generative retouching was used.

Visual review found no clear anatomy, object-contact or scene-continuity blockers across the ten images. The collection is ready for Bubs's creative review, not a claim of real customer photography. All twenty original/preview checksums match the manifest; 23 local gallery, navigation and image endpoints return HTTP 200. Four development-preview checks pass, including route handling and production refusal. Desktop gallery rendering and the page-index link were checked in the in-app browser. A separate isolated browser verified 390px layout without horizontal overflow, anchor navigation and all ten image loads; the in-app viewport override did not apply during this session.
