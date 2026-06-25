# BRDGE Modules — notes for Claude Code

## What this project is
Per-module `.js` files that the website reads. Module **content is authored in Notion**
(the source of truth) and converted into `.js` files here, then committed to git **manually**
when I ask. The website only ever reads the committed `.js` files — it never talks to Notion.

## When I change tags (my workflow)
1. I edit `BRDGE-Tags.js` by hand — that is the only tag file I touch.
2. I tell you: "I updated BRDGE-Tags.js — sync the fallback and the Notion dropdown."
3. You read `BRDGE-Tags.js`, rewrite `use-tag-constants.ts` to match, update the Notion **Tags**
   dropdown options, then show me what changed. (Details in "Keeping tags in sync" below.)

## Sources of truth (read these before generating or editing a module)
- **Content database (Notion):** BRDGE Modules — https://app.notion.com/p/e55cb9315246405bb5b78fd92f39bd92
- **Canonical structure:** BRDGE — Module Template (code) — https://app.notion.com/p/389472cc45a081fab3c1f0bca5d9675b
- **Field rules:** BRDGE — Module Creation Guide (README) — https://app.notion.com/p/389472cc45a08173bb3be222d7ebf697
- **Order list:** BRDGE — Module Order (JS) — https://app.notion.com/p/389472cc45a0818c9627c075bfb1792f
- **Approved tags (SOURCE OF TRUTH):** `main/BRDGE-Tags.js` in this repo (inside the `main/` folder,
  not the repo root). The website fetches
  this at runtime; it defines the tag groups and the full tag vocabulary. `use-tag-constants.ts`
  is a local fallback that must mirror it, and the Notion **Tags** dropdown must mirror it too.
  Edit `BRDGE-Tags.js` by hand; treat the other two as generated copies (see "Keeping tags in sync").

Match the template's structure exactly. Do not invent, reorder, or omit fields. If the
template and a request conflict, surface the conflict before proceeding.

## How to generate a module `.js` from a Notion row
1. Read the module's row from the **BRDGE Modules** database.
2. Read an **existing module `.js` file in this repo** as the exact format reference — match its
   export style, field order, quoting, and indentation, and write the new file to the same folder.
   Copy the reference for *structure only* — **derive the export name and header comment from this
   module's own slug** (`prize-draw` → `prizeDrawModule`), never copy the reference file's name.
3. Build the module object from the template, filling values from the Notion row (mapping below).
4. **Each module lives in its own folder named after its `slug`, containing a `<slug>.js` file** —
   e.g. `pose-games/pose-games.js`. The folder and the file both match the slug verbatim, including
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
- Illustration → `illustration`
- Animation → `animation`
- Video URL → `videoUrl`
- Video URLs (one per line) → `videoUrls: [...]`
- Gallery (one per line, optional `width` after the filename, e.g. `g-1.png 67%`)
  → `gallery: [{ file, width? }]`
- Gallery Credits → `galleryCredits`
- Client Logos (one per line) → `clientLogos: [...]`

### Highlights (build the array in this order)
- If **Free Highlight Title/Description** are filled, add that first:
  `{ title: <Free Highlight Title>, description: <Free Highlight Description>, image: "", imageWidth: "10%" }`
- Then the four fixed highlights. Titles, icons, `imageSide`, and `imageWidth` come from the
  template; only the **description** comes from Notion:
  1. `{ title: "Twists & Upgrades",      description: <Twists Description>,         image: "icon-wand_stars.svg",  imageWidth: "10%", imageSide: "left" }`
  2. `{ title: "Themed Story Examples",  description: <Themes Description>,         image: "icon-styleguide.svg",  imageWidth: "10%", imageSide: "left" }`
  3. `{ title: "Data That Proves Value", description: <Data/ROI Description>,       image: "icon-insert_chart.svg", imageWidth: "10%", imageSide: "left" }`
  4. `{ title: "Better Together",        description: <Better Together Description>, image: "icon-automation.svg",  imageWidth: "10%", imageSide: "left" }`

### States
`states` is **not** populated from Notion. For a new module, leave it as the template default. For an
existing module, **keep whatever `states` the file already has — never blank it.** Some real files
have fully authored states; those are hand-maintained and must survive a regenerate.

## Media and files
Notion stores only the **filename or URL** of media (Illustration, Animation, Video URL, Video URLs,
Gallery, Client Logos) — never the actual files. The real image/video files are hosted separately
(the repo and `upload.naut.ch`); Notion cannot host or serve them, and its upload links expire. So:
- Treat these fields as text references. Write them through to the `.js` as filenames/URLs as-is.
- Never try to fetch a file from Notion. If a referenced file isn't hosted yet, flag it — don't invent a path.

## Editing an existing module (never destroy existing content)
When a module file already exists, the Notion row **updates text; it does not wipe richer content the
row doesn't carry.**
- Apply from Notion: title, slug (unchanged), tagline, short/long description, categories, tags, and
  highlight descriptions.
- **Preserve from the existing file** whenever the Notion row is empty for them: `illustration`,
  `animation`, `videoUrl`, `videoUrls`, `gallery`, `clientLogos`, and `states`.
- Never replace a populated media/logos/states value with a blank.
- If Notion and the file both have a value and they differ, flag the difference and ask — don't
  silently pick one.

## Importing an existing module into Notion (file → row)
The reverse direction — used to backfill the source of truth for modules that were authored directly
in code. Read `[slug]/[slug].js` and create or update its row in the **BRDGE Modules** database,
reversing the field mapping above:
- Map straight back: title, slug, publish, tagline, short/long description, categories, tags, and the
  media fields (illustration, animation, videoUrl, videoUrls, gallery, clientLogos).
- **Highlights, un-bundled:** put each fixed highlight's description into its matching field — Twists
  Description, Themes Description, Data/ROI Description, Better Together Description. Any extra
  highlight beyond the four goes into Free Highlight Title/Description. Don't import the fixed
  titles/icons — they're template defaults.
- **`states`:** has no Notion field — leave it in the file only; ignore it on import.
- **Status:** set as I specify (final modules are usually `Published`). Ask if I don't say.
- **If a row with that slug already exists,** show the differences and wait — never silently overwrite
  a hand-edited row.
- **Vocabulary mismatch:** if a tag or category in the file isn't in the current `BRDGE-Tags.js` /
  Categories list, the dropdown can't hold it — report it rather than guessing (this surfaces drift
  in older modules).

## Rules
- **Tags and categories must be EXACT matches** to the approved lists — spelling, casing, spacing
  (e.g. `"AR / XR"`, `"NFC / RFID / QR Code"`, `"High Energy"`). If a value isn't on the list,
  stop and flag it. Never invent, merge, or re-case.
- **Slugs tie to the folder name, file name, and URL path.** Preserve the existing slug, folder/file
  names, and order when editing, unless I explicitly ask to change them. Changing a slug means
  renaming both the folder and the `<slug>.js` file to match, and updating the Order (JS) page.
- **Typos:** if you spot a likely typo (slug, title, tag, anywhere), tell me the exact value and a
  suggested fix. Do not silently change it. Still use the slug verbatim for the file name.
- **New module → update the Order (JS) page.** Default: next order number (current highest + 1),
  appended last, using its title and slug. If I ask for a specific position, insert it there and
  shift every later module by +1 so the sequence stays contiguous and unique.
- **Export naming:** each module's exported object and header comment must be named after the module
  itself — the slug in camelCase + `Module` (e.g. `prize-draw` → `prizeDrawModule`), never a generic
  name like `module` or a leftover copied from another file. Set this from the slug when generating;
  don't inherit it from the reference file. If you spot a file whose export/header doesn't match its
  slug, flag it as a likely copy-paste bug.
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
