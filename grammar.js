/**
 * Tree-sitter grammar for Sweave / knitr (.Rnw) files.
 *
 * Node hierarchy:
 *
 *   source_file
 *     ├── code_chunk
 *     │     ├── chunk_header   <<label, options>>=\n
 *     │     ├── chunk_body?    (one or more r_line nodes)
 *     │     │     └── r_line   one R source line
 *     │     └── chunk_end      @...\n
 *     └── text_line            one LaTeX prose line
 *
 * Precedence:
 *   chunk_header / chunk_end  → 2  (highest)
 *   r_line                    → 1  (inside code_chunk only)
 *   text_line                 → 0  (lowest)
 *
 * Injection targets:
 *   chunk_body  → R      (one injection per chunk, no `combined` needed)
 *   text_line   → LaTeX  (`combined` merges consecutive lines into one block)
 */

module.exports = grammar({
  name: "sweave",

  // Do not skip any whitespace automatically.
  extras: ($) => [],

  rules: {
    // Root: alternating LaTeX prose lines and Sweave code chunks.
    source_file: ($) => repeat(choice($.code_chunk, $.text_line)),

    // A complete Sweave / knitr code chunk.
    code_chunk: ($) => seq($.chunk_header, optional($.chunk_body), $.chunk_end),

    // Explicit grouping of R lines — makes injection clean and per-chunk.
    chunk_body: ($) => repeat1($.r_line),

    // <<label, options>>=   (full line including trailing newline)
    chunk_header: ($) => token(prec(2, /<<[^\n]*>>=[ \t]*\n/)),

    // One R source line: any line that does NOT start with '@' (chunk_end
    // wins at prec 2 for those), or a blank line.
    r_line: ($) => token(prec(1, /[^@\n][^\n]*\n|\n/)),

    // The closing '@' line (may have trailing comment or whitespace).
    chunk_end: ($) => token(prec(2, /@[^\n]*\n?/)),

    // A line of LaTeX prose (lowest precedence — yields to all chunk tokens).
    text_line: ($) => token(prec(0, /[^\n]*\n|[^\n]+/)),
  },
});
