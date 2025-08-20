# Obsidian Prettier

Format your Obsidian vault content using [Prettier](https://prettier.io).

## Features

- **Manual formatting**: Use the "Format current file with Prettier" command
- **Auto-formatting**: Automatically format files when switching between notes
- **Configuration**: Use Prettier config files or plugin settings
- **Multiple parsers**: Support for Markdown, TypeScript, JavaScript, HTML, PostCSS, YAML, and Babel

## Configuration

### Prettier Config Files

Place any of these files in your vault root to configure formatting:

- `.prettierrc`
- `.prettierrc.yaml` / `.prettierrc.yml`
- `.prettierrc.json`
- `prettier.yaml` / `prettier.yml`
- `prettier.json`

### Plugin Settings

Configure basic formatting options in the plugin settings:

- **[Tab Width](https://prettier.io/docs/en/options.html#tab-width)**: Number of spaces per indentation level
- **[Use Tabs](https://prettier.io/docs/en/options.html#tabs)**: Use tabs instead of spaces for indentation
- **[Print Width](https://prettier.io/docs/en/options.html#print-width)**: Maximum line length before wrapping
- **[Prose Wrap](https://prettier.io/docs/en/options.html#prose-wrap)**: How to wrap prose (always, never, preserve)

For all available options, see the [Prettier documentation](https://prettier.io/docs/en/options.html).

## Commands

- **Format current file**: Open command palette and run "Format current file with Prettier"

## Installation

### BRAT

1. Install the [BRAT plugin](https://github.com/TfTHacker/obsidian42-brat)
2. Add this repository: `jheddings/obsidian-prettier`
3. Enable the plugin in your settings
