# BRDGE Modules — notes for Claude Code

## What this project is
Per-module `.json` files that the website reads. **Notion is the source of truth** for module
content, but it is usually **not where a module starts**: most modules are now **drafted with AI
(you, Claude Code)** from a brief (a description, a product/reference URL, or pasted copy), written
straight to `{slug}/{slug}.json`, and then the Notion row is **backfilled from the file**. Notion
can still be the starting point too (fill the row first, then generate the file from it). Either
way, Notion stays the canonical record, the committed `.json` is what ships, and files are
committed to git **manually** when I ask. The website only ever reads the committed `.json` files —
it never talks to Notion. Each `.json` file is a **plain module object** (no `export`, no comments,
no trailing commas), so the site can `fetch` `{slug}/{slug}.json` and `res.json()` it directly.

## When I change tags (my workflow)
1. I edit `BRDGE-Tags.js` by hand — that is the only tag file I touch.
2. I tell you: "I updated BRDGE-Tags.js — sync the fallback and the Notion dropdown."
3. You read `BRDGE-Tags.js`, rewrite `use-tag-constants.ts` to match, update the Notion **Tags**
   dropdown options, then show me what changed. (Details in "Keeping tags in sync" below.)

## Sources of truth (read these before generating or editing a module)
- **Content database (Notion):** BRDGE Modules — https://app.notion.com/p/e55cb9315246405bb5b78fd92f39bd92
- **Canonical structure and field rules:** BRDGE — Module Creation Guide (README) —
  https://app.notion.com/p/389472cc45a08173bb3be222d7ebf697. The module template (code) is the
  "Module template (code)" toggle at the top of that page; the states framework is in its States
  section. (The old Module Template and States Logic pages are only pointers now.)
- **Order list (SOURCE OF TRUTH):** `main/BRDGE-Module-order.js` in this repo — the module list, card
  order, and canonical titles and slugs. The website reads it directly. There is no Notion copy to
  keep in sync anymore (the old Module Order (JS) page is only a pointer).
- **Approved tags (SOURCE OF TRUTH):** `main/BRDGE-Tags.js` in this repo (inside the `main/` folder,
  not the repo root). The website fetches
  this at runtime; it defines the tag groups and the full tag vocabulary. `use-tag-constants.ts`
  is a local fallback that must mirror it, and the Notion **Tags** dropdown must mirror it too.
  Edit `BRDGE-Tags.js` by hand; treat the other two as generated copies (see "Keeping tags in sync").

Match the template's structure exactly. Do not invent, reorder, or omit fields. If the
template and a request conflict, surface the conflict before proceeding.

## How to generate a module `.json` from a Notion row
1. Read the module's row from the **BRDGE Modules** database.
2. Read an **existing module `.json` file in this repo** as the exact format reference for field
   order and shape. Each file is a single **plain JSON object** (no `export const`, no comments,
   no trailing commas), pretty-printed with 2-space indentation. Write the new file to the module's
   own folder.
3. Build the module object from the template, filling values from the Notion row (mapping below).
4. **Each module lives in its own folder named after its `slug`, containing a `<slug>.json` file**,
   e.g. `pose-games/pose-games.json`. The folder and the file both match the slug verbatim, including
   any existing typo. Never use the display title. Place new modules following the same location and
   pattern as existing module folders.
5. For a **new** module, leave anything the row doesn't provide as `""` or `[]`. For an **existing**
   module, see "Editing an existing module" below — never blank a field the row happens to leave empty.

## Field mapping (Notion column → module object key)
- Title → `title`
- Slug → `slug`
- Publish (checkbox) → `publish` (true / false)
- Tagline → `tagline`
- Short Description → `shortDescription`
- Long Description → `longDescription`
- Categories (multi-select) → `categories: [...]` (exact strings)
- Tags (multi-select) → `tags: [...]` (exact strings)
- Illustration → `illustration` (filename, e.g. `crowd-games-illustration.svg`; same value in Notion and
  in the `.json`)
- Animation → `animation` (filename, e.g. `crowd-games-animation.json`)
- Video URL → `videoUrl`
- Video URLs (one per line) → `videoUrls: [...]`
- Gallery (one per line, optional `width` after the filename, e.g. `g-1.png 67%`)
  → `gallery: [{ file, width? }]`
- Gallery Credits → `galleryCredits`
- Client Logos (one per line) → `clientLogos: [...]`
- Highlight fields (descriptions + optional titles, and Free Highlight 1–3) → see **Highlights** below.
- Status (select: `1. Idea` / `2. Drafting` / `3. Copy done` / `4. Media done` / `5. Can be improved`
  / `6. Good enough`) → **not exported** (internal progress tracker).
- Notes / Missing → **not exported** (internal scratch field).

### Highlights (build the array in this order)
- **Free highlights (up to 5).** For each filled slot, add it first (before the four standard ones),
  default `image: "icon-check_circle.svg"` (never leave `image` empty — empty renders a plain number,
  which we don't want for free highlights). Slot → fields:
  - Slot 1: `Free Highlight1 Title` + `Free Highlight1 Description`
  - Slot 2: `Free Highlight2 Title` + `Free Highlight2 Description`
  - Slot 3: `Free Highlight3 Title` + `Free Highlight3 Description`
  - Slot 4: `Free Highlight4 Title` + `Free Highlight4 Description`
  - Slot 5: `Free Highlight5 Title` + `Free Highlight5 Description`
  Each → `{ title: <slot title>, description: <slot description>, image: "icon-check_circle.svg", imageWidth: "10%" }`
- Then the four standard highlights. Icons, `imageSide`, and `imageWidth` are fixed (below), unless
  the slot shows a designed highlight image instead (see **Highlight images** below). The
  **description** always comes from Notion. **Always write a custom, contextual title** for each:
  use the module's `… Title` field if filled, else draft a contextual one from the module's content.
  (JSON has no comments, so the default title is not stored in the file. The four defaults are the
  fixed constants listed below, and the custom title also lives in the module's Notion `… Title`
  field, so reverting is a one-field change there.) Icons stay fixed even when the title is
  customized (the slot's meaning is unchanged; only its wording is).
  1. Default **"Twists & Upgrades"** — custom title from `Twists Title` (else drafted); `description: <Twists Description>`; `image: "icon-wand_stars.svg"`, `imageWidth: "10%"`, `imageSide: "left"`
  2. Default **"Themed Story Examples"** — custom title from `Themes Title` (else drafted); `description: <Themes Description>`; `image: "icon-styleguide.svg"`, `imageWidth: "10%"`, `imageSide: "left"`
  3. Default **"Data That Proves Value"** — custom title from `Data/ROI Title` (else drafted); `description: <Data/ROI Description>`; `image: "icon-insert_chart.svg"`, `imageWidth: "10%"`, `imageSide: "left"`
  4. Default **"Better Together"** — custom title from `Connections Title` (else drafted); `description: <Connections Description>`; `image: "icon-automation.svg"`, `imageWidth: "10%"`, `imageSide: "left"`
- The four defaults (below) stay consistent across the catalogue; a custom title only changes the
  wording of that slot, never its meaning or icon.
- **No redundant standard highlights.** A standard highlight (Twists / Themes / Data / Connections)
  must add a dimension the free highlights don't already cover. If it would largely restate a free
  highlight, either give it genuinely distinct content or **omit it entirely** — never pad the array
  with a near-duplicate. A module may ship with fewer than four standard highlights.
- **Data/ROI framing.** Data capture is mostly an optional add-on, not a built-in guarantee. Write the
  Data/ROI description as an opt-in step ("Add a data layer to…", "Bolt on…", "Add an optional … layer
  that…"), never as a toggle ("Switch on / Enable / Turn on") or an affirmative claim ("Captures X").

### Highlight images (desktop + mobile)
Some modules have designed highlight images in their folder: a landscape desktop version
(`highlight-<name>.png`, 1280×720) and a tall mobile version (`highlight-<name>-mobile.png`, 390 px
wide) that stacks the same pictures vertically for readability.
- Any highlight, free or standard, may show one instead of its icon:
  `"image": "highlight-<name>.png"`, `"imageMobile": "highlight-<name>-mobile.png"`. Put `imageMobile`
  right after `image`. Default layout for these is `imageWidth: "70%"` with `imageSide` alternating
  `"left"` / `"right"` across the module's image highlights.
- `imageMobile` has **no width or side**: on mobile it always renders full width above the text. If
  `imageMobile` is missing, mobile falls back to `image`.
- Desktop and mobile are **the same highlight**: one object, one `title` and `description`. Never
  create separate mobile highlights or different mobile copy.
- Match an image to a highlight by what it shows, not by its filename (e.g. a `themes` image goes
  on the Themes slot, a `settings` image showing venues goes on the "fits any venue" highlight). If
  no highlight fits an image, leave the image unused and flag it rather than forcing a match.
- When a standard slot shows a photo, it is still that slot (same meaning, same Notion fields);
  only its icon is replaced.
- Notion has **no fields for highlight images**. `image`, `imageMobile`, `imageWidth`, and
  `imageSide` on photo highlights are file-only, like `states` (see "Editing an existing module").

### States
`states` is **not** populated from Notion. For a new module, leave it as the template default. For an
existing module, **keep whatever `states` the file already has — never blank it.** Some real files
have fully authored states; those are hand-maintained and must survive a regenerate.

## Media and files
Notion stores only the **filename or URL** of media (Illustration, Animation, Video URL, Video URLs,
Gallery, Client Logos) — never the actual files. The real image/video files are hosted separately
(the repo and `upload.naut.ch`); Notion cannot host or serve them, and its upload links expire. So:
- Treat these fields as text references. Write them through to the `.json` as filenames/URLs as-is.
- **Illustrations are SVG only.** Each module's cover is the recolorable `<slug>-illustration.svg`;
  the website and the rebranded partner catalogs recolor it to the brand color
  (`main/brdge-illustrations.js`). The old PNG exports were removed (they were outdated, and nothing
  used them). If a bitmap is ever needed (email, social preview, slides), render a PNG from the
  current SVG on demand instead of storing one in the repo.
- **File names include the slug**, so a file can't end up in the wrong module: the cover illustration
  is `<slug>-illustration.svg`, the Lottie cover animation is `<slug>-animation.json`, and extra
  versions are numbered (`<slug>-illustration2.svg`, `<slug>-animation2.json`). Never name a file
  just `illustration.*` or `animation.json`, and never save an animation as `<slug>.json` (that name
  is reserved for the module file). The recolor script recognises any file name ending in
  `illustration.svg` / `.png` (optionally numbered).
- Never try to fetch a file from Notion. If a referenced file isn't hosted yet, flag it — don't invent a path.

## Editing an existing module (never destroy existing content)
When a module file already exists, the Notion row **updates text; it does not wipe richer content the
row doesn't carry.**
- Apply from Notion: title, slug (unchanged), tagline, short/long description, categories, tags, and
  highlight descriptions.
- **Preserve from the existing file** whenever the Notion row is empty for them: `illustration`,
  `animation`, `videoUrl`, `videoUrls`, `gallery`, `clientLogos`, and `states`.
- **Always preserve highlight images** from the existing file: when a highlight shows a photo
  (`image` is not an `icon-*.svg`), keep its `image`, `imageMobile`, `imageWidth`, and `imageSide` and
  update only its title and description from Notion. Never reset it to the slot's default icon.
- Never replace a populated media/logos/states value with a blank.
- If Notion and the file both have a value and they differ, flag the difference and ask — don't
  silently pick one.

## Importing an existing module into Notion (file → row)
The reverse direction — used to backfill the source of truth for modules that were authored directly
in code. Read `[slug]/[slug].json` and create or update its row in the **BRDGE Modules** database,
reversing the field mapping above:
- Map straight back: title, slug, publish, tagline, short/long description, categories, tags, and the
  media fields (illustration, animation, videoUrl, videoUrls, gallery, clientLogos).
- **Illustration:** write the file's `illustration` value to Notion as-is (e.g.
  `crowd-games-illustration.svg`), only if that file exists in the module folder; otherwise leave the
  Notion field blank and flag it.
- **Highlights, un-bundled:** put each standard highlight's description into its matching field —
  `Twists Description`, `Themes Description`, `Data/ROI Description`, `Connections Description`. If a
  highlight's title differs from the standard default, put it in the matching title field (`Twists
  Title`, `Themes Title`, `Data/ROI Title`, `Connections Title`); if it matches the default, leave the
  title field blank. Any highlights beyond the four go into the free-highlight slots (1–5) — slot 1 =
  `Free Highlight1 Title` + `Free Highlight1 Description`, slots 2–5 = `Free Highlight{N} Title` +
  `Free Highlight{N} Description`. Don't import the standard icons — they're fixed defaults.
  Identify standard slots by icon; a highlight that shows a photo instead belongs to the slot its
  content matches (e.g. a themes image = Themes). Highlight images (`image`, `imageMobile`) are not
  imported; they stay in the file only.
- **`states`:** has no Notion field — leave it in the file only; ignore it on import.
- **Status & Publish:** these are separate. `Publish` (checkbox) maps to the file's `publish`. `Status`
  is the internal tracker — set as I specify; for finished modules use `6. Good enough` (there is no
  "Published" status). Ask if I don't say.
- **If a row with that slug already exists,** show the differences and wait — never silently overwrite
  a hand-edited row.
- **Vocabulary mismatch:** if a tag or category in the file isn't in the current `BRDGE-Tags.js` /
  Categories list, the dropdown can't hold it — report it rather than guessing (this surfaces drift
  in older modules).

## Rules
- **No em dashes in module copy.** When writing or editing any module copy (tagline, descriptions,
  highlight titles/descriptions), do not use em dashes (—). Use commas, parentheses, or separate
  sentences instead. This applies whether drafting fresh copy or editing existing copy, across the
  whole catalogue. (This rule is about the copy you generate, not about reformatting text I typed
  into Notion — copy from a Notion row verbatim.)
- **Tags and categories must be EXACT matches** to the approved lists — spelling, casing, spacing
  (e.g. `"AR / XR"`, `"NFC / RFID / QR Code"`, `"High Energy"`). If a value isn't on the list,
  stop and flag it. Never invent, merge, or re-case.
- **Tag comprehensively.** Don't tag minimally — apply every approved tag the module's copy genuinely
  supports (the richer modules run ~20–30 tags across mood, mechanics, technology, content, audience,
  venue, and goal), not just the few most obvious ones. Add only what the content justifies.
- **Module names referenced in copy** (e.g. Better Together / Connections pairings) must be real,
  current module names taken **exactly** from the order list `main/BRDGE-Module-order.js` (the source
  of truth for what modules exist). Never invent a name or use one from memory — older names drift
  (e.g. it's "Visitor Identificator", not "Visitor Token Pass"; "Journey Manager", not "Journey"). If
  unsure, read the order list and use the exact title. Flag any pairing name you can't find on the list.
- **Slugs tie to the folder name, file name, and URL path.** Preserve the existing slug, folder/file
  names, and order when editing, unless I explicitly ask to change them. Changing a slug means
  renaming both the folder and the `<slug>.json` file to match, and updating `main/BRDGE-Module-order.js`.
- **Typos:** if you spot a likely typo (slug, title, tag, anywhere), tell me the exact value and a
  suggested fix. Do not silently change it. Still use the slug verbatim for the file name.
- **New module → update `main/BRDGE-Module-order.js`.** Default: next order number (current highest + 1),
  appended last, using its title and slug. If I ask for a specific position, insert it there and
  shift every later module by +1 so the sequence stays contiguous and unique.
- **Plain JSON object:** each module file is a single JSON object with no wrapper, no `export`, and
  no comments. The file *name* ties it to the slug (`<slug>/<slug>.json`); there is no export name
  or header comment to set.
- If a row is missing copy, offer to draft it using the AI prompt in the README — don't invent
  technical claims.

## Keeping tags in sync
`BRDGE-Tags.js` is the single source of truth for the tag vocabulary and groups. When tags change,
they change there first — then propagate:
- Update `use-tag-constants.ts` so the fallback matches `BRDGE-Tags.js` exactly. Do not maintain it
  as a separate hand-written list.
- Update the Notion **Tags** dropdown options (in the BRDGE Modules database) to match — add missing
  options; for removals or renames, flag them to me rather than deleting silently (existing rows may
  use them).
If I ask you to check, compare `BRDGE-Tags.js`, `use-tag-constants.ts`, and the Notion Tags options
and report any drift before generating modules.

## Commits (only when I say so)
Do not commit automatically. After generating or editing files, show me a short summary of what
changed and wait. When I confirm, stage the changed module file(s) and the Order file, commit with
a clear message, and push.
