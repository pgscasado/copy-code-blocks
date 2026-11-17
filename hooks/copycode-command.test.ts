import type { On } from 'claude-code'
import type { Engine } from 'claude-code/testing'
import { expect, test } from 'claude-code/testing'

const REPLY = ['```ts', 'const a = 1', '```', '', '```sh', 'npm test', '```'].join('\n')

// Each test stands for the engine beneath the plugin: the clipboard and the
// command registry. The reply's blocks are stored by a real `turn.complete`.
function standIns(on: On, copied: string[]) {
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('turn.complete', (_, e) => ({ text: e.answer }))
  on('command.register', () => ({ value: { command: 'copycode' } }))
  on('ui.copy', (_, e) => {
    copied.push(e.text)
    return { value: { isCopied: true } }
  })
}

async function startWithReply(
  $: Engine,
  on: On,
  copied: string[],
  answer = REPLY,
) {
  standIns(on, copied)
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  await $.turn.complete({ reason: 'answer', answer, durationMs: 1, isAborted: false, turnId: 't1' })
}

test('/copycode copies the last block of the last reply', async ($, on) => {
  const copied: string[] = []
  await startWithReply($, on, copied)

  const { text } = await $.command.run({ command: 'copycode', args: '', origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 80 } })

  expect(text).toBe('Copied block 2.')
  expect(copied).toEqual(['npm test'])
})

test('/copycode 1 copies block 1', async ($, on) => {
  const copied: string[] = []
  await startWithReply($, on, copied)

  const { text } = await $.command.run({ command: 'copycode', args: '1', origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 80 } })

  expect(text).toBe('Copied block 1.')
  expect(copied).toEqual(['const a = 1'])
})

test('/copycode list lists the blocks and copies nothing', async ($, on) => {
  const copied: string[] = []
  await startWithReply($, on, copied)

  const { text } = await $.command.run({ command: 'copycode', args: 'list', origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 80 } })

  expect(text).toBe('#1 ts, const a = 1\n#2 sh, npm test')
  expect(copied).toEqual([])
})

test('/copycode 9 says the block is out of range and copies nothing', async ($, on) => {
  const copied: string[] = []
  await startWithReply($, on, copied)

  const { text } = await $.command.run({ command: 'copycode', args: '9', origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 80 } })

  expect(text).toBe('No block 9: the last reply has 2.')
  expect(copied).toEqual([])
})
