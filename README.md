# Obsidian Prettier

Format your Obsidian vault content using [Prettier](https://prettier.io).

## Features

- **Manual formatting**: Use the "Format current file with Prettier" command
- **Auto-formatting**: Automatically format files when switching between notes
- **Configuration**: Use Prettier config files or plugin settings
- **Multiple parsers**: Support for Markdown, TypeScript, JavaScript, HTML, PostCSS, YAML, and Babel
- **Pragma support**: Only format files with `@prettier` or `@format` comments when enabled
- **Smart notifications**: Configurable notices that show formatting results
- **Comprehensive settings**: Organized settings tabs for different formatting aspects

## Configuration

### Prettier Config Files

Place any of these files in your vault root to configure formatting:

- `.prettierrc`
- `.prettierrc.yaml` / `.prettierrc.yml`
- `.prettierrc.json`
- `prettier.yaml` / `prettier.yml`
- `prettier.json`

### Plugin Settings

Several key options are also available in the UI.

#### Formatting

- **[Tab Width](https://prettier.io/docs/en/options.html#tab-width)**: Number of spaces per indentation level (1-8)
- **[Use Tabs](https://prettier.io/docs/en/options.html#tabs)**: Use tabs instead of spaces for indentation
- **[Print Width](https://prettier.io/docs/en/options.html#print-width)**: Maximum line length before wrapping (1-200)
- **[Single Quotes](https://prettier.io/docs/en/options.html#quotes)**: Use single quotes instead of double quotes
- **[Bracket Spacing](https://prettier.io/docs/en/options.html#bracket-spacing)**: Print spaces between brackets in object literals

#### Markdown

- **[Prose Wrap](https://prettier.io/docs/en/options.html#prose-wrap)**: How to wrap prose (always, never, preserve)
- **[Embedded Language Formatting](https://prettier.io/docs/en/options.html#embedded-language-formatting)**: Control whether Prettier formats quoted code embedded in markdown code blocks
- **[HTML Whitespace Sensitivity](https://prettier.io/docs/en/options.html#html-whitespace-sensitivity)**: Specify how to handle whitespace around HTML tags in markdown
- **[Require Pragma](https://prettier.io/docs/en/options.html#require-pragma)**: Only format files that contain a special `@prettier` or `@format` comment
- **[Insert Pragma](https://prettier.io/docs/en/options.html#insert-pragma)**: Insert a `@format` marker at the top of formatted files

#### Code Blocks

- **[Trailing Comma](https://prettier.io/docs/en/options.html#trailing-commas)**: Print trailing commas wherever possible in multi-line code blocks
- **[Arrow Parens](https://prettier.io/docs/en/options.html#arrow-function-parentheses)**: Include parentheses around a sole arrow function parameter in code blocks
- **[Quote Props](https://prettier.io/docs/en/options.html#quote-props)**: Change when properties in objects are quoted in code blocks
- **[Semicolons](https://prettier.io/docs/en/options.html#semicolons)**: Print semicolons at the ends of statements in code blocks

#### File Options

- **[End of Line](https://prettier.io/docs/en/options.html#end-of-line)**: Specify the line ending style to use (LF, CRLF, CR, Auto)

#### Plugin

- **Auto Format**: Automatically format files when switching between notes
- **Show Notices**: Display notices after formatting (when disabled, notices are only shown for errors)
- **Log Level**: Set the logging level for console output (Debug, Info, Warn, Error, Silent)

For all available options, see the [Prettier documentation](https://prettier.io/docs/en/options.html).

## Commands

- **Format current file**: Open command palette and run "Format current file with Prettier"

## Installation

### BRAT

1. Install the [BRAT plugin](https://github.com/TfTHacker/obsidian42-brat)
2. Add this repository: `jheddings/obsidian-prettier`
3. Enable the plugin in your settings
