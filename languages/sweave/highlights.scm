; highlights.scm — Sweave / knitr
;
; Sweave-specific structural tokens only.
; R and LaTeX content are highlighted via injections.scm.

; Chunk header: <<label, options>>=
; @keyword gives a distinct colour in virtually every Zed theme.
(chunk_header) @keyword

; Chunk end marker: @
(chunk_end) @keyword
