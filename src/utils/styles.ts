/**
 * The `head` / `border` style options: lists of ansis style names (e.g. `['bold', 'red']`)
 * and hex colours (`hex(#ff8800)`, `bgHex(#123)`), applied to the text with ansis.
 */
import ansis, { type Ansis } from 'ansis';

/**
 * Style names that were accepted by earlier versions (colors.js / ansis 3) but no longer
 * exist in ansis 4, mapped to their ansis 4 names, so that existing table styles
 * (including the default border style 'grey') keep working.
 */
const STYLE_ALIASES: ReadonlyMap<string, string> = new Map([
  ['grey', 'gray'],
  ['bgGrey', 'bgGray'],
  ['strike', 'strikethrough'],
]);

/** A style list resolved into one ansis style, or the first entry that is not a valid style. */
type Resolution = { style: Ansis } | { invalid: unknown };

/**
 * Parses the hex colour of a style like `hex(#ff00aa)` or `bgHex(#f0a)`.
 * Returns black (`#000`) if there is no valid hex colour.
 */
export function parseHexValue(style: string): string {
  const [value] = style.match(/#[0-9a-fA-F]{3,6}/) ?? ['#000'];
  return value;
}

/** Chains the styles onto ansis, from the last entry to the first. */
function resolveStyles(styles: ArrayLike<unknown>): Resolution {
  let style = ansis;
  for (const entry of Array.from(styles).toReversed()) {
    if (typeof entry !== 'string') {
      return { invalid: entry };
    }
    if (entry.startsWith('hex') || entry.startsWith('bgHex')) {
      const value = parseHexValue(entry);
      style = entry.startsWith('bgHex') ? style.bgHex(value) : style.hex(value);
    } else {
      // Style names are user input: look them up dynamically.
      const next: unknown = (style as unknown as Record<string, unknown>)[toAnsisStyleName(entry)];
      if (typeof next !== 'function' || typeof (next as Partial<Ansis>).open !== 'string') {
        return { invalid: entry };
      }
      style = next as Ansis;
    }
  }
  return { style };
}

/**
 * Applies `styles` to `text`. If any entry is not a valid style, `text` is returned unstyled.
 */
export function applyStyles(styles: ArrayLike<unknown> | undefined, text: string): string {
  if (!styles?.length) {
    return text;
  }
  const resolution = resolveStyles(styles);
  return 'style' in resolution ? resolution.style(text) : text;
}

/**
 * Returns a debug message if `styles` contains an entry that is not a valid style
 * (see `applyStyles`), otherwise `undefined`. `where` names the option, e.g. "style.head of cell 0-1".
 */
export function invalidStyleMessage(styles: ArrayLike<unknown> | undefined, where: string): string | undefined {
  if (!styles?.length) {
    return undefined;
  }
  const resolution = resolveStyles(styles);
  if ('style' in resolution) {
    return undefined;
  }
  const { invalid } = resolution;
  const shown = typeof invalid === 'string' ? `"${invalid}"` : String(invalid);
  return `Invalid style ${shown} in ${where}; the text is not styled.`;
}

function toAnsisStyleName(name: string): string {
  const bright = /^(bg)?[bB]right([A-Z][a-z]*)$/.exec(name);
  if (bright) {
    const color = String(bright[2]);
    return bright[1] ? `bg${color}Bright` : `${color.toLowerCase()}Bright`;
  }
  const background = /^([a-z]+)BG$/.exec(name);
  if (background) {
    const color = String(background[1]);
    return `bg${color.charAt(0).toUpperCase()}${color.slice(1)}`;
  }
  return STYLE_ALIASES.get(name) ?? name;
}
