# Contributing

Thanks for your interest in improving the Pokémon GO Code Giveaway Helper! This
project is a static, client-side tool, so making changes is quick and lightweight.

## Ways to Help

- **Report bugs** with as much detail as possible using the “Bug report” issue
  template. Include steps to reproduce, browser and OS information, and any
  console errors.
- **Request features or UX tweaks** with the “Feature request” template. Explain
  the problem being solved and any constraints (event size, device type, etc.).
- **Triage issues** by reproducing reported problems and confirming fixes.
- **Submit pull requests** that fix bugs, improve documentation, polish the UI,
  or add languages the official Pokémon GO store supports.

## Development Workflow

1. Fork the repository and create a branch for your change.
2. Make your edits. Everything lives in static files (`index.html`, `print.html`,
   plus supporting `css/` and `js/` assets).
3. Open `index.html` or `print.html` in your browser to test locally. No build
   step is required.
4. Ensure the QR codes, localization, and storage features still behave as
   expected.
5. Run a self-review before submitting. Aim for accessible markup and responsive
   layouts.

## Pull Request Checklist

- Include screenshots or GIFs when the UI changes.
- Update documentation if behavior or workflows change.
- Add tests if you introduce new logic that can be covered with lightweight unit
  tests (for example, by extracting helpers into `js/` and covering them with a
  browser-friendly test harness).
- Reference related issues in the PR description (e.g. `Closes #42`).

## Community Expectations

All contributors must follow the [Code of Conduct](.github/CODE_OF_CONDUCT.md).
If you observe unacceptable behavior, please report it using the channels
described in the Code of Conduct.
