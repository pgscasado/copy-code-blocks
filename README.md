# copy-code-blocks

Copy the fenced code blocks from Claude's replies without selecting them by hand.

## What it does

- **Copy buttons.** Each fenced code block in a reply gets a copy row under it, labelled `[copy <lang> #n]`, where `<lang>` is the fence's language (or `plain`) and `n` is the block's number in the reply. Clicking it copies that block's code, without the fences.
- **`/copycode [n|list]`** works on the same blocks:
  - `/copycode` copies the last block.
  - `/copycode n` copies block `n` (1-based).
  - `/copycode list` lists the blocks with their number, language and first line, and copies nothing.

## Load it

```
claude --plugin-dir C:\Users\User\claude-mods\copy-code-blocks
```

## Run its tests

```
claude plugin test C:\Users\User\claude-mods\copy-code-blocks
```

Check the manifest and hooks with `claude plugin validate C:\Users\User\claude-mods\copy-code-blocks`.

## Limits

- The right-click menu row is not included. The menu API gives the mod only a message id, not the reply's text, so it cannot find the blocks from there.
- `/copycode` and the buttons read the latest reply only as stored when its turn ended. A reply still streaming is not available until its turn completes.
