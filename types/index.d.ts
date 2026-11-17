export type CodeBlock = { lang: string; code: string }

declare module 'claude-code' {
  interface PluginState {
    'copy-code-blocks': {
      // The blocks of the latest reply that was not a summary.
      blocks: Shaped<CodeBlock[]>
    }
  }
}
