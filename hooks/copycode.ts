import type { CodeBlock } from './blocks'

export type CopycodeResult = {
  /** The transcript line the command shows. */
  text: string
  /** The code to copy to the clipboard, when the command copies a block. */
  copy?: string
}

/** The first line of a block's code, for the list. */
function firstLine(code: string): string {
  return code.split('\n')[0] ?? ''
}

/**
 * Answers `/copycode [n | list]` against the blocks of the last reply.
 * No argument copies the last block; `n` (1-based) copies block n.
 */
export function runCopycode(blocks: CodeBlock[], args: string): CopycodeResult {
  if (blocks.length === 0) {
    return { text: 'No code blocks in the last reply.' }
  }

  const arg = args.trim()

  if (arg === 'list') {
    const lines = blocks.map(
      (block, index) => `#${index + 1} ${block.lang || 'plain'}, ${firstLine(block.code)}`,
    )
    return { text: lines.join('\n') }
  }

  if (arg === '') {
    const n = blocks.length
    return { text: `Copied block ${n}.`, copy: blocks[n - 1].code }
  }

  if (!/^\d+$/.test(arg)) {
    return { text: 'Usage: /copycode [n | list]' }
  }

  const n = Number(arg)
  if (n < 1 || n > blocks.length) {
    return { text: `No block ${n}: the last reply has ${blocks.length}.` }
  }

  return { text: `Copied block ${n}.`, copy: blocks[n - 1].code }
}
