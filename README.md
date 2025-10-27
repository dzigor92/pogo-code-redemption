# Pokémon GO Code Giveaway Helper

> Static helper for handing out Pokémon GO digital codes during community events.

This repository hosts a single-page helper that streamlines handing out Pokémon GO passcodes during community events.

## Features

- Paste a batch of codes (newline or comma separated) and load them into the tool.
- Generate the official redemption link and QR code for the first pending code.
- Mark codes as redeemed to keep a running history and avoid duplicates.
- Resume exactly where you left off after a refresh thanks to automatic local storage.
- Generate a printable QR sheet for the pending codes with a single click.
- Pick the Pokémon GO store language (en, es, pt, de, fr) before generating links and QR codes.
- Clear the session and load a fresh set whenever new codes arrive.

## Using the page locally

1. Open `index.html` in any modern browser.
2. Choose the redemption language (defaults to English), paste your codes into the textarea (one per line works best), and press **Load codes**.
3. When you're ready to hand out a code, click **Give away code**.
4. Ask the trainer to scan the QR code or tap the redemption link.
5. After they redeem it, click **Mark as redeemed** to archive the code and move to the next one.

> Tip: You can press `Ctrl+Enter` (`⌘+Enter` on macOS) while the textarea is focused to load codes quickly.
> Bonus: If you refresh the page, the pending list will be restored automatically and the textarea will repopulate so you can keep going.
> Need printed codes? Press **Printable sheet** and download/print the generated template. (Open it from the same browser where you loaded the session so it can read the saved codes.)

## Embedding in Google Sites

Google Sites lets you embed custom HTML snippets. To embed this tool:

1. Open [Google Sites](https://sites.google.com/) and edit your site.
2. Choose **Insert → Embed** and switch to the **Embed code** tab.
3. Copy the entire contents of `index.html` and paste them into the embed dialog.
4. Click **Next**, adjust the size of the embed frame if needed, and publish your site.

The page only depends on standard browser features; the QR generator is bundled locally, so it works within Google Sites without additional hosting.

## Guía rápida para embajadores

Compartan estas instrucciones con quienes vayan a repartir códigos:

1. Abran la página del asistente en el navegador (idealmente en pantalla completa).
2. Pidan el lote de códigos y cópienlos tal como los reciban (uno por línea o separados por comas).
3. Seleccionen el idioma del portal de canje (por defecto inglés), péguenlos en el campo “Bulk code list” y presionen **Load codes**. La herramienta confirmará cuántos códigos se cargaron.
4. Cuando llegue una persona para reclamar un código, presionen **Give away code**. En pantalla aparecerá:
   - El código alfanumérico.
   - El enlace directo de canje.
   - El código QR listo para escanear.
5. Esperen a que la persona confirme que lo canjeó. Luego presionen **Mark as redeemed**:
   - El código se mueve al historial de “Redeemed codes”.
   - La herramienta queda lista para entregar el siguiente código.
6. Repitan los pasos 4 y 5 hasta que aparezca el mensaje “No more codes available”.
7. Si reciben otro lote, usen **Reset session** para limpiar la sesión y carguen la nueva lista.

Recomendaciones:

- La herramienta guarda el progreso de forma local, así que si el navegador se actualiza o se cierra la pestaña, la sesión se restaura automáticamente.
- Mantengan la página abierta y eviten refrescarla innecesariamente para no interrumpir el flujo.
- Si hay varios embajadores, dividan los códigos en bloques diferentes para evitar duplicados.
- Ante un error al cargar, revisen que no haya espacios en blanco extra; la herramienta filtra códigos vacíos automáticamente.
- Si necesitan entregar códigos impresos, presionen **Printable sheet** y utilicen la hoja generada; solo incluye los códigos pendientes. Asegúrense de abrir la hoja desde el mismo navegador donde cargaron los códigos, porque lee la sesión guardada.
- Al terminar el evento, usen **Reset session** (o borren los datos del navegador) para que nadie más vea códigos entregados previamente.

## Customising

All styling and logic lives inside `index.html`. Feel free to tweak the CSS or replace the QR generation logic with a preferred library if you need offline QR images.

## Contributing

Curious about helping out? Check the [contribution guidelines](CONTRIBUTING.md),
review our [Code of Conduct](.github/CODE_OF_CONDUCT.md), and read the
[security policy](.github/SECURITY.md) for responsible disclosure details.
The project is licensed under the [MIT License](LICENSE).
