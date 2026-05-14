# Sweave — Zed Extension

Zed language extension for **Sweave / knitr** (`.Rnw`) files — LaTeX with
embedded R chunks delimited by `<<...>>=` … `@`.

## Requirements (read this first)

Highlighting **depends on two other extensions** from the Zed marketplace:

1. **[LaTeX](https://github.com/rzukic/zed-latex)** — provides the `LaTeX` parser used for prose lines.
2. **[R](https://github.com/ocsmit/zed-r)** — provides the `R` parser used inside code chunks.

Install both, restart Zed if needed, then install this extension. Without them,
you may see only chunk delimiters highlighted or almost no colour.

### Only chunk delimiters are coloured (body looks plain)

That means the **Sweave** layer is active (`highlights.scm` on `<<…>>=` / `@`), but
**injected** highlighting for **R** and **LaTeX** is not being applied.

1. **Confirm the other languages work on their own** — open a `.R` and a `.tex`
   file. If those buffers are also mostly unstyled, fix or reinstall the **R**
   and **LaTeX** extensions first; Sweave cannot inject parsers that are not
   loaded.
2. In **Extensions**, ensure **R** and **LaTeX** are installed **and** enabled
   (not disabled). Restart Zed after enabling them, then reinstall the Sweave
   dev extension if you use one.
3. In `settings.json`, do **not** map `Rnw` / `rnw` to **LaTeX** under
   `file_types` — that forces the whole file to the LaTeX grammar and bypasses
   Sweave (and its injections).
4. After changing `languages/sweave/injections.scm`, run **Install dev
   extension** again on this folder (or reload the window) so Zed picks up the
   new queries.

If problems persist, use **zed: open log** and search for messages about
`grammar`, `language`, `Sweave`, `R`, or `LaTeX` around the time you open an
`.Rnw` file.

## Current status

| Feature | Status |
|---|---|
| LaTeX highlighting (prose) | ✅ Via LaTeX extension injection |
| R highlighting in `<<>>=` chunks | ✅ Via R extension injection |
| Chunk header / `@` highlighting | ✅ Sweave `highlights.scm` |
| Bracket matching | ✅ From injected LaTeX / R grammars |

## Why injections?

Zed highlights via **Tree-sitter**. Sweave mixes LaTeX and R; this repo ships a
small wrapper grammar plus `injections.scm` so Zed reuses the same parsers as
`.tex` and `.R` files.

## Project Structure

```
zed-rnoweb/
├── grammar.js              # Tree-sitter grammar source
├── src/                    # Generated parser (tree-sitter generate)
├── languages/sweave/
│   ├── config.toml         # Language configuration
│   ├── highlights.scm      # Syntax highlight queries
│   └── injections.scm      # R / LaTeX injection queries
├── tests/
│   └── latex_fdt.Rnw       # Test file for grammar development
├── package.json
├── tree-sitter.json
└── extension.toml
```

## Installation (dev)

1. Install the **LaTeX** and **R** extensions from the Zed Extensions panel.
2. Clone this repository (or use your existing copy).
3. Command palette → **zed: install dev extension** → choose this folder
   (the directory that contains `extension.toml`).

Zed will download a WASI SDK and compile the Tree-sitter grammar on first load
(needs network once). If installation fails, open **zed: open log** or run
`zed --foreground` from a terminal and look for `grammar` / `clang` / `wasi-sdk`
errors.

### Grammar checkout stuck or wrong revision

Zed keeps a **nested git clone** for the Tree-sitter grammar. When you install
this folder as a **dev extension**, that clone lives next to your sources:

`zed-rnoweb\grammars\sweave\`

(not only under `%LocalAppData%\Zed\extensions\…`).

If you see **`grammar directory … already exists, but is not a git clone of`**
in **zed: open log**, Zed found an old `grammars\sweave` whose `origin` URL does
not match `repository` in `extension.toml` (for example you switched between
`https://…` and `file:///…`, or the folder was half-created). Fix:

1. Quit Zed (optional but avoids file locks).
2. From the repo root, remove the clone, then reinstall the dev extension:
   - **npm:** `npm run clean-zed-grammar`
   - **PowerShell:** `Remove-Item -Recurse -Force .\grammars\sweave`

After a successful build you should see `grammars\sweave\.git` and
`grammars\sweave.wasm`; both are listed in `.gitignore` and must not be
committed.

### Log noise that is *not* this extension

- **`unknown variant 'write'`** (agent / thread): Zed Agent protocol mismatch;
  unrelated to Sweave highlighting.
- **`language not found`** (`acp_thread`): often the Agent / diff path when no
  buffer language is bound; unrelated to the grammar WASM build.
- **`failed to load language Sweave: no such grammar sweave`**: usually means
  the grammar step above failed earlier; fix the clone + reinstall dev
  extension, then restart Zed.

### Developing the grammar without pushing to GitHub

`extension.toml` uses `commit = "main"` against this repository so installs
track the default branch. To test **unpublished** `grammar.js` / `src/`
changes, temporarily point the grammar entry at your working tree:

```toml
[grammars.sweave]
repository = "file:///C:/Users/you/Documents/GitHub/zed-rnoweb"
commit     = "HEAD"
```

Use three slashes after `file:` on Windows (`file:///C:/...`). Revert to the
HTTPS URL + `main` before publishing or opening a PR to the extensions index.

### Windows

Grammar compilation is supported on **64-bit Windows** (x86_64) via WASI SDK.
Other Windows targets may not be supported by Zed’s extension builder yet.

## File extensions handled

`.Rnw`, `.rnw`, `.Snw`, `.snw`

## Roadmap

- [x] Tree-sitter wrapper grammar + LaTeX / R injections
- [ ] Optional: language server wiring (e.g. knitr-aware tooling)
- [ ] Submit / maintain listing in the Zed extension registry

## Authors

José C. Faria <joseclaudio.faria@gmail.com>
