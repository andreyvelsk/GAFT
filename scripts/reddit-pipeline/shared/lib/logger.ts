import type {
  Logger,
  LoggerOptions,
  LogLevel,
  LogRecord,
} from './types';

/** Numeric ordering of the log levels (higher = more severe). */
const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/** Format a record as a single line (plain text or JSON). */
function formatRecord(record: LogRecord, json: boolean): string {
  if (json) {
    return JSON.stringify(record);
  }
  const keys = Object.keys(record.context);
  const context = keys.length > 0 ? ` ${JSON.stringify(record.context)}` : '';
  return `[${record.time}] ${record.level.toUpperCase()} ${record.message}${context}`;
}

/** Write a line to stdout, appending a newline. */
function writeLine(line: string): void {
  process.stdout.write(`${line}\n`);
}

/**
 * Create a structured logger. Records below the configured level are dropped;
 * `json` switches the output to one JSON object per line (useful in CI).
 */
export function createLogger(options: LoggerOptions = {}): Logger {
  const level = options.level ?? 'info';
  const json = options.json ?? false;
  const write = options.write ?? writeLine;
  const now = options.now ?? ((): Date => new Date());
  const baseContext = options.context ?? {};

  const emit = (
    recordLevel: LogLevel,
    message: string,
    context?: Record<string, unknown>,
  ): void => {
    if (LEVEL_ORDER[recordLevel] < LEVEL_ORDER[level]) {
      return;
    }
    const record: LogRecord = {
      level: recordLevel,
      message,
      time: now().toISOString(),
      context: { ...baseContext, ...(context ?? {}) },
    };
    write(formatRecord(record, json));
  };

  return {
    debug: (message, context): void => {
      emit('debug', message, context);
    },
    info: (message, context): void => {
      emit('info', message, context);
    },
    warn: (message, context): void => {
      emit('warn', message, context);
    },
    error: (message, context): void => {
      emit('error', message, context);
    },
    child: (context): Logger =>
      createLogger({ ...options, context: { ...baseContext, ...context } }),
  };
}
