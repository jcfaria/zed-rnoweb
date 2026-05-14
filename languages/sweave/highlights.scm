; highlights.scm — Sweave / knitr
;
; Sweave-specific structural tokens only.
; R and LaTeX content are highlighted via injections.scm.

; Chunk header: <<label, options>>=
; @keyword gives a distinct colour in virtually every Zed theme.
(chunk_header) @keyword

; Chunk end marker: @
(chunk_end) @keyword

; The whole code_chunk node (header + body + end) is tagged with the custom
; scope "r-chunk".  By itself this does nothing visible; the user activates it
; by adding a background_color entry to theme_overrides in settings.json:
;
;   "theme_overrides": {
;     "syntax": {
;       "r-chunk": { "background_color": "#f5f0e8" }
;     }
;   }
;
; The injected R highlights still render on top of the background.
; A full-width (line-spanning) background is not yet supported by Zed core,
; but will work once upstream adds that capability (tracked in zed#7336).
(code_chunk) @r-chunk
