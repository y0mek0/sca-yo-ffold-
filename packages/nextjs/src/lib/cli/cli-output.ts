const ESC = '\x1b[';
const RESET = `${ESC}0m`;
const BOLD = `${ESC}1m`;
const DIM = `${ESC}2m`;
const FG_GREEN = `${ESC}32m`;
const FG_YELLOW = `${ESC}33m`;
const FG_RED = `${ESC}31m`;
const FG_CYAN = `${ESC}36m`;
const FG_GRAY = `${ESC}90m`;
const FG_WHITE = `${ESC}97m`;

export type OutputOptions = {
  color?: boolean;
};

function code(open: boolean, sequence: string): string {
  return open ? sequence : '';
}

export function formatHeadline(title: string, options: OutputOptions = {}): string {
  const color = options.color ?? true;
  const rule = '─'.repeat(Math.max(20, title.length + 4));
  return `${code(color, FG_CYAN)}${rule}${RESET}\n${code(color, BOLD + FG_WHITE)}  ${title}${RESET}\n${code(color, FG_CYAN)}${rule}${RESET}`;
}

export function formatCheck(name: string, ok: boolean, detail: string, options: OutputOptions = {}): string {
  const color = options.color ?? true;
  const tag = ok
    ? `${code(color, FG_GREEN)}${code(color, BOLD)} OK ${RESET}`
    : `${code(color, FG_YELLOW)}${code(color, BOLD)} WARN${RESET}`;
  const label = ok
    ? `${code(color, FG_WHITE)}${name}${RESET}`
    : `${code(color, FG_YELLOW)}${name}${RESET}`;
  const value = ok
    ? `${code(color, FG_GRAY)}${detail}${RESET}`
    : `${code(color, FG_RED)}${detail}${RESET}`;
  return `${tag} ${label.padEnd(28)} ${value}`;
}

export function formatSuccess(message: string, options: OutputOptions = {}): string {
  const color = options.color ?? true;
  return `${code(color, FG_GREEN)}${code(color, BOLD)}✓${RESET} ${code(color, BOLD)}${message}${RESET}`;
}

export function formatError(message: string, detail?: Record<string, unknown>, options: OutputOptions = {}): string {
  const color = options.color ?? true;
  const lines = [`${code(color, FG_RED)}${code(color, BOLD)}✗ ${message}${RESET}`];
  if (detail) {
    for (const [key, value] of Object.entries(detail)) {
      lines.push(`  ${code(color, FG_GRAY)}${key}:${RESET} ${JSON.stringify(value)}`);
    }
  }
  return lines.join('\n');
}

export function formatHint(message: string, options: OutputOptions = {}): string {
  const color = options.color ?? true;
  return `${code(color, FG_CYAN)}${code(color, BOLD)}→${RESET} ${code(color, DIM)}${message}${RESET}`;
}

export function formatJson(value: unknown, options: OutputOptions = {}): string {
  const color = options.color ?? true;
  const text = JSON.stringify(value, null, 2);
  if (!color) return text;
  return text
    .split('\n')
    .map((line) => `${code(color, FG_GRAY)}${line}${RESET}`)
    .join('\n');
}
