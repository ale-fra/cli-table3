/**
 * Table and cell options: their types, the defaults, and merging user options with them.
 */

export type CharName =
  | 'top'
  | 'top-mid'
  | 'top-left'
  | 'top-right'
  | 'bottom'
  | 'bottom-mid'
  | 'bottom-left'
  | 'bottom-right'
  | 'left'
  | 'left-mid'
  | 'mid'
  | 'mid-mid'
  | 'right'
  | 'right-mid'
  | 'middle';

export type HorizontalAlignment = 'left' | 'center' | 'right';
export type VerticalAlignment = 'top' | 'center' | 'bottom';

/** A primitive cell value; it is rendered as `String(value)`. */
export type CellValue = boolean | number | bigint | string | null | undefined;

export interface CellOptions {
  content?: CellValue;
  chars?: Partial<Record<CharName, string>>;
  truncate?: string;
  colSpan?: number;
  rowSpan?: number;
  hAlign?: HorizontalAlignment;
  vAlign?: VerticalAlignment;
  wordWrap?: boolean;
  wrapOnWordBoundary?: boolean;
  href?: string;
  style?: {
    'padding-left'?: number;
    'padding-right'?: number;
    head?: string[];
    border?: string[];
  };
}

/** A cell as passed to the table: a primitive value or a cell options object. */
export type CellInput = CellValue | CellOptions;

export interface TableStyle {
  'padding-left': number;
  'padding-right': number;
  /** Styles of the header row (names of ansis styles, or `hex(#rrggbb)` / `bgHex(#rrggbb)`). */
  head: string[];
  /** Styles of the table border. */
  border: string[];
  /** Omit the separator lines between data rows. */
  compact: boolean;
}

/** The table options that are not merged one level deep (see `TableInstanceOptions`). */
export interface TableOptions {
  truncate: string;
  /** Fixed column widths; `null` (or a missing entry) means "fit the content". */
  colWidths: Array<number | null>;
  /** Fixed row heights; `null` (or a missing entry) means "fit the content". */
  rowHeights: Array<number | null>;
  colAligns: HorizontalAlignment[];
  rowAligns: VerticalAlignment[];
  head: CellInput[];
  wordWrap?: boolean;
  wrapOnWordBoundary?: boolean;
}

/** Options that are only read, never set by the defaults. */
interface ExtraOptions {
  /** @deprecated Use `wordWrap`. */
  textWrap?: boolean;
  /** `true` or a level (1: blocking issues, 2: cell information, 3: all); see `table.messages`. */
  debug?: boolean | number | string;
}

/** The options of a table (`table.options`): the user options merged with the defaults. */
export interface TableInstanceOptions extends TableOptions, ExtraOptions {
  chars: Record<CharName, string>;
  style: TableStyle;
}

/** The options accepted by the Table constructor. */
export interface TableConstructorOptions extends Partial<TableOptions>, ExtraOptions {
  chars?: Partial<Record<CharName, string>>;
  style?: Partial<TableStyle>;
}

/** Returns a new default options object (callers may modify it). */
function defaultOptions(): TableInstanceOptions {
  return {
    chars: {
      top: '─',
      'top-mid': '┬',
      'top-left': '┌',
      'top-right': '┐',
      bottom: '─',
      'bottom-mid': '┴',
      'bottom-left': '└',
      'bottom-right': '┘',
      left: '│',
      'left-mid': '├',
      mid: '─',
      'mid-mid': '┼',
      right: '│',
      'right-mid': '┤',
      middle: '│',
    },
    truncate: '…',
    colWidths: [],
    rowHeights: [],
    colAligns: [],
    rowAligns: [],
    style: {
      'padding-left': 1,
      'padding-right': 1,
      head: ['red'],
      border: ['grey'],
      compact: false,
    },
    head: [],
  };
}

/** `object` without its properties that are set to `undefined`. */
function withoutUndefined<T extends object>(object: T | undefined): Partial<T> {
  return Object.fromEntries(Object.entries(object ?? {}).filter(([, value]) => value !== undefined)) as Partial<T>;
}

/**
 * Merges the user options with the defaults. `chars` and `style` are merged one level deep;
 * all other options replace the default value. Options set to `undefined` keep their default.
 */
export function mergeOptions(options?: TableConstructorOptions): TableInstanceOptions {
  const defaults = defaultOptions();
  return {
    ...defaults,
    ...withoutUndefined(options),
    chars: { ...defaults.chars, ...withoutUndefined(options?.chars) },
    style: { ...defaults.style, ...withoutUndefined(options?.style) },
  };
}
