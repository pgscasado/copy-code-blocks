import type { CodeBlock } from './blocks'

/** The transcript row a desktop right-click menu was opened on, as the menu reports it. */
export interface MenuRow {
  component: string
  requestId: string
}

/**
 * The blocks a right-click menu offers copy rows for: the stored blocks of the
 * reply when the click lies in an assistant message, none otherwise.
 */
export function offeredBlocks(
  row: MenuRow | undefined,
  blocks: CodeBlock[],
): CodeBlock[] {
  if (row?.component !== 'AssistantMessage') return []

  return blocks
}
