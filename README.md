# Pokémon GO Code Giveaway Helper

This repository hosts a single-page helper that streamlines handing out Pokémon GO passcodes during community events.

## Features

- Paste a batch of codes (newline or comma separated) and load them into the tool.
- Generate the official redemption link and QR code for the first pending code.
- Mark codes as redeemed to keep a running history and avoid duplicates.
- Resume exactly where you left off after a refresh thanks to automatic local storage.
- Clear the session and load a fresh set whenever new codes arrive.

## Using the page locally

1. Open `index.html` in any modern browser.
2. Paste your codes into the textarea (one per line works best) and press **Load codes**.
3. When you're ready to hand out a code, click **Give away code**.
4. Ask the trainer to scan the QR code or tap the redemption link.
5. After they redeem it, click **Mark as redeemed** to archive the code and move to the next one.

> Tip: You can press `Ctrl+Enter` (`⌘+Enter` on macOS) while the textarea is focused to load codes quickly.
> Bonus: If you refresh the page, the pending list will be restored automatically and the textarea will repopulate so you can keep going.

## Embedding in Google Sites

Google Sites lets you embed custom HTML snippets. To embed this tool:

1. Open [Google Sites](https://sites.google.com/) and edit your site.
2. Choose **Insert → Embed** and switch to the **Embed code** tab.
3. Copy the entire contents of `index.html` and paste them into the embed dialog.
4. Click **Next**, adjust the size of the embed frame if needed, and publish your site.

The page only depends on standard browser features; the QR generator is bundled locally, so it works within Google Sites without additional hosting.

## Customising

All styling and logic lives inside `index.html`. Feel free to tweak the CSS or replace the QR generation logic with a preferred library if you need offline QR images.
