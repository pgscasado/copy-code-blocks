import { expect, test } from 'claude-code/testing'
import { runCopycode } from './copycode'
import type { CodeBlock } from './blocks'

const BLOCKS: CodeBlock[] = [
  { lang: 'ts', code: 'const a = 1\nconst b = 2' },
  { lang: '', code: 'echo hi' },
]

test('no stored blocks says so', () => {
  expect(runCopycode([], '').text).toBe('No code blocks in the last reply.')
})

test('no argument copies the last block', () => {
  expect(runCopycode(BLOCKS, '')).toEqual({ text: 'Copied block 2.', copy: 'echo hi' })
})

test('a number copies that block, 1-based', () => {
  expect(runCopycode(BLOCKS, '1')).toEqual({
    text: 'Copied block 1.',
    copy: 'const a = 1\nconst b = 2',
  })
})

test('list gives one line per block: its number, language and first line', () => {
  expect(runCopycode(BLOCKS, 'list').text).toBe('#1 ts, const a = 1\n#2 plain, echo hi')
})

test('a number out of range says how many blocks there are', () => {
  expect(runCopycode(BLOCKS, '9')).toEqual({
    text: 'No block 9: the last reply has 2.',
  })
})

test('zero is out of range too', () => {
  expect(runCopycode(BLOCKS, '0').text).toBe('No block 0: the last reply has 2.')
})

test('an unknown argument gets the usage line', () => {
  expect(runCopycode(BLOCKS, 'banana').text).toBe('Usage: /copycode [n | list]')
})
