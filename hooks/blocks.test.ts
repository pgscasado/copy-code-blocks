import { expect, test } from 'claude-code/testing'
import { extractBlocks } from './blocks'

test('a backtick fence gives its language and inner lines', () => {
  expect(extractBlocks('text\n```ts\nconst a = 1\n\nb()\n```\nafter')).toEqual([
    { lang: 'ts', code: 'const a = 1\n\nb()' },
  ])
})

test('a tilde fence is a fence too', () => {
  expect(extractBlocks('~~~python\nprint(1)\n~~~')).toEqual([
    { lang: 'python', code: 'print(1)' },
  ])
})

test('no info string gives an empty lang', () => {
  expect(extractBlocks('```\nplain\n```')).toEqual([{ lang: '', code: 'plain' }])
})

test('the info string keeps only its first word', () => {
  expect(extractBlocks('```js title="x.js"\nx\n```')).toEqual([{ lang: 'js', code: 'x' }])
})

test('a longer fence contains a shorter one', () => {
  const md = '````md\n```js\ninner\n```\n````'
  expect(extractBlocks(md)).toEqual([{ lang: 'md', code: '```js\ninner\n```' }])
})

test('a tilde fence does not close a backtick fence', () => {
  expect(extractBlocks('```\n~~~\n```')).toEqual([{ lang: '', code: '~~~' }])
})

test('a fence indented inside a list item is found and dedented', () => {
  const md = '1. step\n\n   ```sh\n   npm test\n     indented\n   ```\n2. next'
  expect(extractBlocks(md)).toEqual([{ lang: 'sh', code: 'npm test\n  indented' }])
})

test('an unclosed fence at the end is not emitted', () => {
  expect(extractBlocks('```js\nfirst\n```\n```ts\nnever closed')).toEqual([
    { lang: 'js', code: 'first' },
  ])
})

test('an empty block gives empty code', () => {
  expect(extractBlocks('```\n```')).toEqual([{ lang: '', code: '' }])
})

test('several blocks come out in order', () => {
  expect(extractBlocks('```a\n1\n```\nx\n~~~b\n2\n~~~').map(b => b.lang)).toEqual(['a', 'b'])
})

test('text with no fences gives no blocks', () => {
  expect(extractBlocks('just prose\n`inline`')).toEqual([])
})
