export interface CodeBlock {
  lang: string
  code: string
}

const FENCE = /^( {0,})(`{3,}|~{3,})(.*)$/

/**
 * Extract fenced code blocks from markdown text.
 * Handles ``` and ~~~ fences, longer fences containing shorter ones,
 * fences indented inside list items, and ignores unclosed fences.
 */
export function extractBlocks(markdown: string): CodeBlock[] {
  const lines = markdown.split(/\r?\n/)
  const blocks: CodeBlock[] = []

  let i = 0
  while (i < lines.length) {
    const open = FENCE.exec(lines[i])
    if (!open) {
      i++
      continue
    }

    const indent = open[1].length
    const marker = open[2]
    const info = open[3]
    const char = marker[0]

    // A backtick fence's info string may not contain backticks.
    if (char === '`' && info.includes('`')) {
      i++
      continue
    }

    const body: string[] = []
    let j = i + 1
    let closed = false
    while (j < lines.length) {
      const line = lines[j]
      const close = /^ *(`{3,}|~{3,}) *$/.exec(line)
      if (close && close[1][0] === char && close[1].length >= marker.length) {
        closed = true
        break
      }
      body.push(stripIndent(line, indent))
      j++
    }

    if (closed) {
      const lang = info.trim().split(/\s+/)[0] ?? ''
      blocks.push({ lang, code: body.join('\n') })
      i = j + 1
    } else {
      // Unclosed fence: nothing after this point is a closed block.
      break
    }
  }

  return blocks
}

function stripIndent(line: string, indent: number): string {
  let n = 0
  while (n < indent && n < line.length && line[n] === ' ') n++
  return line.slice(n)
}
