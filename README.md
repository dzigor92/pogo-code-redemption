# Pokémon GO Code Giveaway Helper

> Static helper for handing out Pokémon GO digital codes during community events.

This repository hosts a single-page helper that streamlines handing out Pokémon GO passcodes during community events.

**Use it now: <https://dzigor92.github.io/pogo-code-redemption/>** — nothing to install, no account. Your codes stay in your browser and are never sent anywhere.

## Features

- Paste a batch of codes (newline or comma separated) and load them into the tool. Repeated codes are removed automatically.
- Add more codes mid-event by pasting them below the pending ones: the redeemed history is kept, and codes already redeemed are skipped.
- Generate the official redemption link and QR code for the first pending code. Once codes are loaded the list folds away, so the QR is the first thing on screen and the pending codes stay out of sight.
- Hand out codes with one tap per trainer: **Redeemed → next code** archives the code on screen and shows the next one.
- Keeps the screen awake while a code is displayed (on browsers that support it).
- Mark codes as redeemed to keep a running history and avoid duplicates.
- Resume exactly where you left off after a refresh thanks to automatic local storage.
- Generate a printable QR sheet for the pending codes with a single click, and mark the whole sheet as handed out so those codes are not offered again on screen.
- Pick the Pokémon GO store language (English, Spanish, Portuguese, German, French, Italian, Japanese or Korean) before generating links and QR codes.
- Clear the session (after a confirmation) and load a fresh set whenever you want to start over.

## How to use it

1. Open the [live page](https://dzigor92.github.io/pogo-code-redemption/), or download the repository and open `index.html` in any modern browser.
2. Choose the redemption language (defaults to English), paste your codes into the textarea (one per line works best), and press **Load codes**.
3. When you're ready to hand out a code, click **Give away code**.
4. Ask the trainer to scan the QR code or tap the redemption link.
5. After they redeem it, press **Redeemed → next code** to archive it and show the next code, or **Redeemed → hide QR** to archive it and stop showing codes.

> Tip: You can press `Ctrl+Enter` (`⌘+Enter` on macOS) while the textarea is focused to load codes quickly.
> Bonus: If you refresh the page, the pending list will be restored automatically and the textarea will repopulate so you can keep going.
> Need printed codes? Press **Printable sheet** and download/print the generated template. (Open it from the same browser where you loaded the session so it can read the saved codes.)

## Customising

It is a static site with no build step: edit a file and reload.

- `index.html`, `css/styles.css`, `js/app.js`: the giveaway page.
- `print.html`, `css/print.css`, `js/print.js`: the printable sheet.
- `js/shared.js`: what both pages share, including the list of store languages, the redemption link and the saved session.
- `js/qrcode.min.js`: [QRCode.js](https://github.com/davidshimjs/qrcodejs) by davidshimjs (MIT, see `js/qrcode.min.js.LICENSE.txt`).

The scripts are plain `<script>` files rather than ES modules so the pages keep working when opened straight from disk.

## Contributing

Curious about helping out? Check the [contribution guidelines](CONTRIBUTING.md),
review our [Code of Conduct](.github/CODE_OF_CONDUCT.md), and read the
[security policy](.github/SECURITY.md) for responsible disclosure details.
The project is licensed under the [MIT License](LICENSE).
