import type { Shaped } from 'claude-code'

import type { CodeBlock } from '../hooks/blocks'

declare module 'claude-code' {
  interface PluginState {
    'copy-code-blocks': {
      // The blocks of the latest reply that was not a summary.
      blocks: Shaped<CodeBlock[]>
    }
  }
}
