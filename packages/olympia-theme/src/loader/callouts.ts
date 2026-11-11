// A trailing callout list: optional line-comment prefix, then one or more `<1>`, `<.>` or `<!--1-->` markers.
const CALLOUT_LINE =
  /(?:\s*(?:\/\/|#|--|;;))?((?:\s*(?<!\\)(?:<!--(?:\d+|\.)-->|<(?:\d+|\.)>))+)\s*$/;
const CALLOUT_MARKER = /<!--(\d+|\.)-->|<(\d+|\.)>/g;
const ESCAPED_MARKER = /\\(<!--(?:\d+|\.)-->|<(?:\d+|\.)>)/g;

export interface ExtractedCallouts {
  /** The code with callout markers removed and `\<1>` escapes restored to `<1>`. */
  code: string;
  /** 1-based line number to the callout numbers placed on that line. */
  callouts: Map<number, number[]>;
}

/**
 * Splits AsciiDoc code-callout markers (`// <1>`, `<.>`, `<!--1-->`) from a listing's source.
 * `<.>` is numbered by its own counter (1, 2, ...), as Asciidoctor does; mixing it with explicit numbers is unsupported.
 */
export function extractCallouts(source: string): ExtractedCallouts {
  const callouts = new Map<number, number[]>();
  let autoNumber = 0;

  const lines = source.split('\n').map((line, index) => {
    const match = CALLOUT_LINE.exec(line);
    if (!match) return line;
    const numbers = [...match[1].matchAll(CALLOUT_MARKER)].map((marker) => {
      const value = marker[1] ?? marker[2];
      return value === '.' ? ++autoNumber : Number(value);
    });
    callouts.set(index + 1, numbers);
    return line.slice(0, match.index).trimEnd();
  });

  return { code: lines.map(unescapeCalloutMarkers).join('\n'), callouts };
}

/** Restores escaped markers (`\<1>`) to literal text, for code whose markers are not callouts. */
export function unescapeCalloutMarkers(source: string): string {
  return source.replace(ESCAPED_MARKER, '$1');
}
