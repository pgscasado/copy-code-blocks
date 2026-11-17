import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import { extractBlocks, type CodeBlock } from './blocks'
import { copyMessage, rowKey, rowLabel } from './copy-rows'
import { offeredBlocks } from './context-rows'
import { runCopycode } from './copycode'

// Change the tag when the stored block shape changes.
const lastBlocks = atom(
  { plugin: 'copy-code-blocks', key: 'blocks' } as const,
  [] as CodeBlock[],
  { shape: 'blocks-1' },
)

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'copycode',
      description: 'Copy a code block from the last reply.',
      argumentHint: '[n | list]',
    })

    return next(e)
  })

  on('command.run', { command: 'copycode' }, async ($, e) => {
    const result = runCopycode(await read($, lastBlocks), e.args)
    if (result.copy === undefined) return { text: result.text }

    const copied = await $.ui.copy({ text: result.copy })

    return {
      text: copied.isCopied ? result.text : `Copy failed: ${copied.reason}`,
    }
  })

  on('turn.complete', async ($, e, next) => {
    if (e.reason === 'answer') {
      await update($, lastBlocks, () => extractBlocks(e.answer))
    }

    return next(e)
  })

  on('ui.render', { component: 'AssistantMessage' }, async ($, e, next) => {
    const tree = await next(e)
    if (e.props.isSummary) return tree

    const blocks = extractBlocks(e.props.text)
    if (blocks.length === 0) return tree

    const { Box, Button, Text } = $.ui.resolve(e)

    return (
      <Box flexDirection="column">
        {tree}
        {blocks.map((block, index) => {
          const n = index + 1

          return (
            <Button
              key={rowKey(n)}
              onPress={async press => {
                const result = await $.ui.copy({
                  text: block.code,
                  surface: press.surface,
                })
                $.ui.toast(copyMessage(n, result))
              }}
            >
              <Text dimColor>{rowLabel(block, n)}</Text>
            </Button>
          )
        })}
      </Box>
    )
  })

  on('ui.render', { component: 'ContextMenu' }, async ($, e, next) => {
    const blocks = offeredBlocks(e.props.row, await read($, lastBlocks))
    if (blocks.length === 0) return next(e)

    const { Box, Button } = $.ui.resolve(e)

    return (
      <Box flexDirection="column">
        {blocks.map((block, index) => {
          const n = index + 1

          return (
            <Button
              key={rowKey(n)}
              onPress={async press => {
                const result = await $.ui.copy({
                  text: block.code,
                  surface: press.surface,
                })
                $.ui.toast(copyMessage(n, result))
              }}
            >
              {`Copy code block ${n}`}
            </Button>
          )
        })}
      </Box>
    )
  })
}
