/**
 * Settings a cell inherits from the table: the cell's own value wins. Both may use the option
 * name (`padding-left`, `top-mid`) or its camel-cased form (`paddingLeft`, `topMid`).
 */
import type { CharName } from '../options';

/** `top-mid` → `topMid` */
type CamelCase<S extends string> = S extends `${infer Head}-${infer Tail}`
  ? `${Head}${Capitalize<CamelCase<Tail>>}`
  : S;

/** The name of a border character as used by a cell, e.g. `topMid` for the `top-mid` option. */
export type CharKey = CamelCase<CharName>;

/** The border characters of a cell. */
export type CellChars = Record<CharKey, string>;

/**
 * Settings as given by the user, looked up by name. They are not validated: values are trusted
 * to have the documented type.
 */
type Settings = object;

const CHAR_NAMES: readonly CharName[] = [
  'top',
  'top-mid',
  'top-left',
  'top-right',
  'bottom',
  'bottom-mid',
  'bottom-left',
  'bottom-right',
  'left',
  'left-mid',
  'mid',
  'mid-mid',
  'right',
  'right-mid',
  'middle',
];

function camelCase<S extends string>(name: S): CamelCase<S> {
  return name.replace(/-(\w)/g, (_, letter: string) => letter.toUpperCase()) as CamelCase<S>;
}

function read(settings: Settings, name: string): unknown {
  return (settings as Readonly<Record<string, unknown>>)[name];
}

/** The first value of the cell, else of the table, that is neither undefined nor null. */
function inherit(cell: Settings, table: Settings, name: string): unknown {
  const key = camelCase(name);
  return [read(cell, key), read(cell, name), read(table, key), read(table, name)].find(
    (value) => value !== undefined && value !== null
  );
}

/** The border characters of a cell (`table` has all of them: it is merged with the defaults). */
export function resolveChars(cell: Settings | undefined, table: Settings): CellChars {
  return Object.fromEntries(CHAR_NAMES.map((name) => [camelCase(name), inherit(cell ?? {}, table, name)])) as CellChars;
}

/** The padding of a cell (`table` has both values: it is merged with the defaults). */
export function resolvePadding(cell: Settings, table: Settings): { left: number; right: number } {
  return {
    left: inherit(cell, table, 'padding-left') as number,
    right: inherit(cell, table, 'padding-right') as number,
  };
}
