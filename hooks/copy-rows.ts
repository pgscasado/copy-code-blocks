import type { UiCopyResult } from 'claude-code'

import type { CodeBlock } from './blocks'

/** The label of the copy row for the n-th block (1-based). */
export function rowLabel(block: CodeBlock, n: number): string {
  return `[copy ${block.lang} #${n}]`
}

/** The key of the copy row for the n-th block (1-based). */
export function rowKey(n: number): string {
  return `copy-${n}`
}

/** The toast line that reports a copy result. */
export function copyMessage(n: number, result: UiCopyResult): string {
  return result.isCopied ? `Copied block ${n}` : `Copy failed: ${result.reason}`
}
