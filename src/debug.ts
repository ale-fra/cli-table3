/**
 * Debug messages are collected per table: while a table renders, everything logged through
 * this module goes to that table's collector (see `collect` and Table#toString). Rendering is
 * synchronous, so a single "current collector" is enough. Outside of `collect` nothing is
 * recorded.
 */

/*
 * Debug levels, from least to most verbose. A table with `debug: n` records the messages of
 * levels 1 to n.
 */

/**
 * Level 1: blocking issues. The table cannot be rendered as given and had to be changed
 * (e.g. a missing cell was added, a row span was limited).
 */
export const WARN = 1;
/** Level 2: information about each rendered cell. */
export const INFO = 2;
/**
 * Level 3: non-blocking issues, where the table is rendered as given but an option is ignored
 * (e.g. an invalid style name), and details about the layout.
 */
export const DEBUG = 3;

/** Receives the debug messages of one table. */
export interface DebugCollector {
  /** Messages up to this level are recorded; 0 disables debugging. */
  level: number;
  readonly messages: string[];
}

let current: DebugCollector | null = null;

function log(message: string, minLevel: number): void {
  if (current && current.level >= minLevel) {
    current.messages.push(message);
  }
}

export function warn(message: string): void {
  log(message, WARN);
}

export function info(message: string): void {
  log(message, INFO);
}

export function debug(message: string): void {
  log(message, DEBUG);
}

/**
 * Runs `fn` with `collector` receiving all debug messages, and returns its result.
 * Calls can be nested; the previous collector is restored afterwards, even if `fn` throws.
 */
export function collect<T>(collector: DebugCollector, fn: () => T): T {
  const previous = current;
  current = collector;
  try {
    return fn();
  } finally {
    current = previous;
  }
}
