; injections.scm — Sweave / knitr
;
; Language names must match Zed's registry exactly (case-sensitive):
;   "R"     → registered as "R"
;   "LaTeX" → registered as "LaTeX"
;
; R: inject the whole chunk body once per chunk (no injection.combined).
;     One coherent range is easier for the R parser and avoids edge cases
;     with per-line combined injections on some Zed builds.
;
; LaTeX: combined merges consecutive prose lines so the LaTeX parser sees a
;     longer fragment (tree-sitter-latex benefits from wider context).

; --- R injection -----------------------------------------------------------
(chunk_body) @injection.content
(#set! injection.language "R")

; --- LaTeX injection -------------------------------------------------------
(text_line) @injection.content
(#set! injection.language "LaTeX")
(#set! injection.combined)
