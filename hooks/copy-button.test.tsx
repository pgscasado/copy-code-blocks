import { expect, test } from 'claude-code/testing'

const TEXT = [
  '```ts',
  'const a = 1',
  '```',
  '',
  '```ts',
  'const b = 2',
  '```',
].join('\n')

const MESSAGE = {
  plugin: 'copy-code-blocks',
  surface: 'desktop',
  component: 'AssistantMessage',
  props: { text: TEXT, isFirstOfReply: true },
} as const

test('pressing copy button #2 copies exactly block 2 code, without fences', async ($, on) => {
  const copied: string[] = []
  on('ui.copy', (_, e) => {
    copied.push(e.text)

    return { value: { isCopied: true } }
  })

  const ui = await $.ui.mount(MESSAGE)

  expect(await ui.find({ type: 'Button', text: /\[copy ts #1\]/ })).toBeDefined()
  expect(await ui.find({ type: 'Button', text: /\[copy ts #2\]/ })).toBeDefined()

  await ui.press({ key: 'copy-2' })

  expect(copied).toEqual(['const b = 2'])
  await ui.unmount()
})
