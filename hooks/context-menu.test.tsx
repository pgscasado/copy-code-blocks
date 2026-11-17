import type { On } from 'claude-code'
import { expect, test } from 'claude-code/testing'

const REPLY = ['```ts', 'const a = 1', '```', '', '```ts', 'const b = 2', '```'].join('\n')

const MENU = {
  plugin: 'copy-code-blocks',
  surface: 'desktop',
  component: 'ContextMenu',
} as const

// The engine's bottom: session start, an empty turn.complete, the command
// registry and the clipboard. The real register.tsx stores the reply's blocks.
function engineBottom(on: On, copied: string[]) {
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('turn.complete', () => ({ text: '' }))
  on('command.register', () => ({ value: { command: 'copycode' } }))
  on('ui.copy', (_, e) => {
    copied.push(e.text)
    return { value: { isCopied: true } }
  })
}

async function startWithReply($: Parameters<Parameters<On>[1]>[0], reply: string) {
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  await $.turn.complete({
    reason: 'answer',
    answer: reply,
    durationMs: 1,
    isAborted: false,
    turnId: 't1',
  })
}

test('a click in an assistant message with blocks gets a row per block', async ($, on) => {
  engineBottom(on, [])
  await startWithReply($, REPLY)

  const ui = await $.ui.mount({
    ...MENU,
    props: { row: { component: 'AssistantMessage', requestId: 'r1' } },
  })

  expect(await ui.find({ type: 'Button', text: /Copy code block 1/ })).toBeDefined()
  expect(await ui.find({ type: 'Button', text: /Copy code block 2/ })).toBeDefined()
  await ui.unmount()
})

test('pressing a row copies exactly that block', async ($, on) => {
  const copied: string[] = []
  engineBottom(on, copied)
  await startWithReply($, REPLY)

  const ui = await $.ui.mount({
    ...MENU,
    props: { row: { component: 'AssistantMessage', requestId: 'r1' } },
  })
  await ui.press({ key: 'copy-2' })

  expect(copied).toEqual(['const b = 2'])
  await ui.unmount()
})

test('a click outside an assistant message hands the menu on', async ($, on) => {
  engineBottom(on, [])
  await startWithReply($, REPLY)

  const ui = await $.ui.mount({
    ...MENU,
    props: { row: { component: 'UserMessage', requestId: 'r2' } },
  })

  expect(await ui.find({ type: 'Button' })).toBeUndefined()
  await ui.unmount()
})

test('a click in a message with no blocks gets no rows', async ($, on) => {
  engineBottom(on, [])
  await startWithReply($, 'Plain text, no code.')

  const ui = await $.ui.mount({
    ...MENU,
    props: { row: { component: 'AssistantMessage', requestId: 'r3' } },
  })

  expect(await ui.find({ type: 'Button' })).toBeUndefined()
  await ui.unmount()
})
