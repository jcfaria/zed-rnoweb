# Literate R & noweb-style chunks - Zed extension

This repository hosts a **Zed extension** aimed at **literate programming with R**: documents that mix a **host language** (LaTeX, Markdown, HTML, …) with **delimited R code chunks**. The long-term idea is one coherent experience across formats such as **`.Rnw`**, **`.Rmd`**, **`.qmd`**, and similar, not only a single file type.

Zed highlights through **Tree-sitter** and **injections**. Where possible, this project **reuses** parsers and queries from existing Zed extensions (LaTeX, Markdown, R, …) so you get **full syntax** in prose and in chunk bodies—as long as those base extensions are installed and enabled.

---

## Vision & goals

| Goal | Description |
|------|-------------|
| **Chunk boundaries** | Reliable recognition of **opening and closing** chunk markers across host formats (Sweave `<<…>>=` … `@`, knitr/Quarto-style **Markdown** fenced blocks, HTML-oriented engines, etc.). |
| **Composed highlighting** | With the right **host** + **R** extensions installed, the buffer should read like a normal `.tex` / `.md` / … file **plus** R inside chunks—not a flat single grammar. |
| **Readable chunks in any theme** | Chunks should **visually stand out** (background, border, or dedicated scopes) in a predictable way, without depending on each user’s theme choices alone. *(Design target; see roadmap.)* |
| **Later** | Optional workflow features (e.g. **send code to R**, knitr/Quarto-aware tooling, LSP wiring) once the language layers are solid. |

---

## Current scope (what works today)

**Implemented now:** **Sweave / knitr LaTeX + R** (`.Rnw`, `.rnw`, `.Snw`, `.snw`) with `<<label, options>>=` … `@` chunks.

| Feature | Status |
|--------|--------|
| Chunk delimiters (`<<…>>=` / `@`) | Supported (Sweave Tree-sitter + `highlights.scm`) |
| LaTeX outside chunks | Via **[LaTeX](https://github.com/rzukic/zed-latex)** injection |
| R inside chunks | Via **[R](https://github.com/ocsmit/zed-r)** injection |
| Bracket matching | From injected LaTeX / R grammars |
| Chunk background colour | Optional — requires one-time `settings.json` entry (see below) |

Everything below that refers to **requirements**, **dev install**, and **troubleshooting** applies to this **Sweave** layer unless noted otherwise.

---

## Chunk background colour

The extension tags every R code chunk with the custom syntax scope **`r-chunk`**.
By itself this scope is invisible; you activate it by adding a `theme_overrides`
entry to your Zed `settings.json` (`zed: open settings file`).

### Activating the background

Add the block below, replacing the theme names with the ones you actually use
(check `"theme"` → `"dark"` / `"light"` in your settings):

```jsonc
"theme_overrides": {
  // Dark theme example
  "One Dark": {
    "syntax": {
      "r-chunk": { "background_color": "#363a45" }
    }
  },
  // Light theme example
  "One Light": {
    "syntax": {
      "r-chunk": { "background_color": "#f0ede4" }
    }
  }
},
```

The colour applies to the entire chunk node — header (`<<…>>=`), body, and
closing `@` — while LaTeX prose keeps the editor's default background.

### Choosing a colour

A good starting point is a shade that is **close but distinct** from your
editor background:

| Theme | Editor background | Suggested `r-chunk` background |
|-------|------------------|--------------------------------|
| One Dark | `#282c34` | `#363a45` (lighter cool grey) |
| One Light | `#fafafa` | `#f0ede4` (warm off-white) |

Adjust to taste — the closer to the editor background, the subtler the effect.

### Known limitation — no full-width strip

Zed currently applies `background_color` **only to the text characters**
within the matched range; the colour does not extend to the right edge of the
editor window as a continuous strip (the RStudio-style panel effect).

This is a Zed core limitation tracked in
[zed-industries/zed #7336](https://github.com/zed-industries/zed/issues/7336)
(closed, not currently scheduled). When Zed eventually adds full-width block
background support, the `r-chunk` scope already in place will work
automatically — no change to this extension will be needed.

---

## Requirements (read this first)

Highlighting **depends on two marketplace extensions**:

1. **[LaTeX](https://github.com/rzukic/zed-latex)** — parser for prose lines.  
2. **[R](https://github.com/ocsmit/zed-r)** — parser inside R chunks.

Install both, restart Zed if needed, then install this extension. Without them, you may see only chunk delimiters highlighted.

### Only chunk delimiters are coloured (body looks plain)

The Sweave layer is active, but **injected** LaTeX/R highlighting is not applied.

1. Open a `.R` and a `.tex` file; if those are also dull, fix **R** and **LaTeX** first.  
2. In **Extensions**, ensure **R** and **LaTeX** are installed **and** enabled; restart Zed; reinstall this dev extension if you use one.  
3. In `settings.json`, do **not** map `Rnw` / `rnw` to **LaTeX** under `file_types`—that forces the whole buffer to LaTeX and **bypasses** Sweave.  
4. After editing `languages/sweave/injections.scm`, run **zed: install dev extension** again (or reload the window).

If it still fails, use **zed: open log** and search for `grammar`, `language`, `Sweave`, `R`, or `LaTeX` when opening an `.Rnw` file.

---

## Why injections?

Sweave mixes **LaTeX** and **R**. This repo ships a **small wrapper grammar** plus `injections.scm` so Zed can reuse the same parsers and highlight rules as standalone `.tex` and `.R` buffers—the same pattern we intend to follow for other hosts (Markdown, HTML, …) as they are added.

---

## Project structure

```
zed-rnoweb/
├── grammar.js              # Tree-sitter grammar source (Sweave)
├── src/                    # Generated parser (tree-sitter generate)
├── languages/sweave/
│   ├── config.toml         # Language id, file suffixes, brackets
│   ├── highlights.scm      # Chunk delimiter highlights
│   └── injections.scm      # LaTeX / R injection queries
├── tests/
│   └── latex_fdt.Rnw       # Sample .Rnw for grammar work
├── package.json
├── tree-sitter.json
└── extension.toml
```

---

## Installation (dev)

1. Install **LaTeX** and **R** from the Zed Extensions panel.  
2. Clone this repository.  
3. Command palette → **zed: install dev extension** → choose the folder that contains `extension.toml`.

On first load Zed may download a **WASI SDK** and compile the grammar (network once). On failure, check **zed: open log** or run `zed --foreground` for `grammar` / `clang` / `wasi-sdk` errors.

### Grammar clone under the repo

Zed keeps a **nested git clone** next to your sources, e.g. `zed-rnoweb\grammars\sweave\` (not only under `%LocalAppData%\Zed\extensions\…`).

If the log shows **`grammar directory … already exists, but is not a git clone of`**, remove the stale clone and reinstall:

- **npm:** `npm run clean-zed-grammar`  
- **PowerShell:** `Remove-Item -Recurse -Force .\grammars\sweave`

After a good build you should see `grammars\sweave\.git` and `grammars\sweave.wasm`; both are gitignored and must not be committed.

### Unpublished grammar edits (`file://`)

To test local `grammar.js` / `src/` before pushing, you can temporarily point the grammar at your working tree in `extension.toml`:

```toml
[grammars.sweave]
repository = "file:///C:/Users/you/Documents/GitHub/zed-rnoweb"
commit     = "HEAD"
```

On Windows use **three** slashes after `file:` (`file:///C:/...`). Switch back to the HTTPS URL + `main` before publishing or opening a PR to the extension index.

### Log noise that is usually unrelated

- **`unknown variant 'write'`** — Agent protocol noise.  
- **`language not found`** (`acp_thread`) — often Agent/diff without a buffer language.  
- **`failed to load language Sweave: no such grammar sweave`** — grammar build/clone failed earlier; fix `grammars/sweave` and reinstall the dev extension.

### Windows

Grammar builds target **64-bit Windows (x86_64)** via WASI SDK. Other Windows targets may not be supported by Zed’s builder yet.

---

## Roadmap

- [x] Sweave / knitr `.Rnw` — Tree-sitter wrapper + LaTeX / R injections  
- [x] **Chunk background** — `r-chunk` scope + `theme_overrides` (partial: text-area only; full-width pending Zed core, see [#7336](https://github.com/zed-industries/zed/issues/7336))  
- [ ] **Markdown + R** (`.Rmd`, `.qmd`, …) — fenced chunks, reuse Markdown + R extensions  
- [ ] **HTML + R** and other host formats where there is a clear chunk model  
- [ ] **Chunk chrome** — full-width background strip once Zed core adds block-level background support  
- [ ] **Workflow** — send to R, knitr/Quarto-oriented tooling, LSP where feasible  
- [ ] **Registry** — submit / maintain listing in the Zed extension catalog  

---

## Authors

José C. Faria <joseclaudio.faria@gmail.com>
