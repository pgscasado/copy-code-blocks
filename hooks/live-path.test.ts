import type { On } from 'claude-code'
import { expect, test } from 'claude-code/testing'

const REPLY = ['```ts', 'const a = 1', '```', '', '```sh', 'npm test', '```'].join('\n')

// The engine's bottom answers session.start, turn.complete (empty: it stores
// nothing), the command registry and the
// clipboard. The real register.tsx handler does the storing, so /copycode
// reading a block proves it.
function engineBottom(on: On, copied: string[]) {
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('turn.complete', () => ({ text: '' }))
  on('command.register', () => ({ value: { command: 'copycode' } }))
  on('ui.copy', (_, e) => {
    copied.push(e.text)
    return { value: { isCopied: true } }
  })
}

test('live turn.complete stores blocks from answer', async ($, on) => {
  const copied: string[] = []
  engineBottom(on, copied)

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  await $.turn.complete({
    reason: 'answer',
    answer: REPLY,
    durationMs: 1,
    isAborted: false,
    turnId: 't1',
  })

  const { text } = await $.command.run({ command: 'copycode', args: '2' })

  expect(text).toBe('Copied block 2.')
  expect(copied).toEqual(['npm test'])
})

test('live turn.complete with no fences stores zero blocks', async ($, on) => {
  const copied: string[] = []
  engineBottom(on, copied)

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  await $.turn.complete({
    reason: 'answer',
    answer: 'No code here, just prose.',
    durationMs: 1,
    isAborted: false,
    turnId: 't2',
  })

  const { text } = await $.command.run({ command: 'copycode', args: '' })

  expect(text).toBe('No code blocks in the last reply.')
  expect(copied).toEqual([])
})
