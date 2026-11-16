/**
 * ANSI SGR ("Select Graphic Rendition") escape sequences, e.g. `\u001b[31m` (red) or
 * `\u001b[1m` (bold): matching them, and tracking which styling is active at a point of a
 * string, so that it can be closed at the end of a line and re-opened on the next one.
 */

/** Returns a new global RegExp matching SGR sequences (new each time: it is stateful). */
export function sgrPattern(): RegExp {
  return /\u001b\[(?:\d*;){0,5}\d*m/g;
}

const sgr = (code: number): string => `\u001b[${code}m`;

const DEFAULT_FOREGROUND = sgr(39);
const DEFAULT_BACKGROUND = sgr(49);

/** Text styles that are tracked, with their on/off sequences (as in colors.js, lib/styles.js). */
const TEXT_STYLES = {
  bold: { on: sgr(1), off: sgr(22) },
  italics: { on: sgr(3), off: sgr(23) },
  underline: { on: sgr(4), off: sgr(24) },
  inverse: { on: sgr(7), off: sgr(27) },
  strikethrough: { on: sgr(9), off: sgr(29) },
} as const;

type TextStyle = keyof typeof TEXT_STYLES;

/** For each tracked on/off sequence: the text style it switches, and whether it switches it on. */
const TEXT_STYLE_SWITCHES = new Map<string, { style: TextStyle; on: boolean }>(
  (Object.keys(TEXT_STYLES) as TextStyle[]).flatMap((style) => [
    [TEXT_STYLES[style].on, { style, on: true }],
    [TEXT_STYLES[style].off, { style, on: false }],
  ])
);

/** The styling that is active at a point of a string. */
export interface AnsiState {
  /** The last foreground colour sequence, e.g. `\u001b[31m`. */
  foreground?: string;
  /** The last background colour sequence, e.g. `\u001b[41m`. */
  background?: string;
  /**
   * Text styles that were switched on or off, in the order in which they first appeared.
   * The order decides the order of the sequences that close and re-open them.
   */
  textStyles: Map<TextStyle, boolean>;
}

export function emptyState(): AnsiState {
  return { textStyles: new Map() };
}

/** Updates `state` with one SGR sequence (as matched by `sgrPattern`). */
export function updateState(state: AnsiState, sequence: string): void {
  // The parameters between "\u001b[" and "m", e.g. "1;31". Only the first one is considered
  // (parseInt stops at the first ";").
  const parameters = sequence.slice(2, -1);
  const code = parameters ? Number.parseInt(parameters, 10) : 0;
  if ((code >= 30 && code <= 39) || (code >= 90 && code <= 97)) {
    state.foreground = sequence;
    return;
  }
  if ((code >= 40 && code <= 49) || (code >= 100 && code <= 107)) {
    state.background = sequence;
    return;
  }
  if (code === 0) {
    // reset
    delete state.foreground;
    delete state.background;
    state.textStyles.clear();
    return;
  }
  const styleSwitch = TEXT_STYLE_SWITCHES.get(sequence);
  if (styleSwitch) {
    state.textStyles.set(styleSwitch.style, styleSwitch.on);
  }
}

/** Returns the styling that is active at the end of `text`. */
function readState(text: string): AnsiState {
  const state = emptyState();
  for (const [sequence] of text.matchAll(sgrPattern())) {
    updateState(state, sequence);
  }
  return state;
}

/** Appends the sequences that switch off the styling in `state`. */
export function closeStyles(state: AnsiState, text: string): string {
  let result = text;
  for (const [style, on] of state.textStyles) {
    if (on) {
      result += TEXT_STYLES[style].off;
    }
  }
  if (state.background && state.background !== DEFAULT_BACKGROUND) {
    result += DEFAULT_BACKGROUND;
  }
  if (state.foreground && state.foreground !== DEFAULT_FOREGROUND) {
    result += DEFAULT_FOREGROUND;
  }
  return result;
}

/** Prepends the sequences that switch on the styling in `state`. */
function reopenStyles(state: AnsiState, text: string): string {
  let result = text;
  for (const [style, on] of state.textStyles) {
    if (on) {
      result = TEXT_STYLES[style].on + result;
    }
  }
  if (state.background && state.background !== DEFAULT_BACKGROUND) {
    result = state.background + result;
  }
  if (state.foreground && state.foreground !== DEFAULT_FOREGROUND) {
    result = state.foreground + result;
  }
  return result;
}

/**
 * Makes every line self-contained: styling that is still active at the end of a line is
 * closed there and re-opened at the start of the next line.
 */
export function colorizeLines(lines: readonly string[]): string[] {
  let state = emptyState();
  return lines.map((input) => {
    const line = reopenStyles(state, input);
    state = readState(line);
    return closeStyles(state, line);
  });
}
