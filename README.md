# Send to Gitter

## Features

Send messages, code snippets, or full files to any Gitter room or one-to-one conversation you are part of directly from VSCode!

[Send to Gitter on the VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=scrthq.vscode-gitter)

![Examples](/examples.png)


## Requirements

You must have a Gitter account and have access to your Personal Access Token. You can find your Personal Access Token after logging into Gitter Developer here: https://developer.gitter.im/apps

## Extension Settings

This extension contributes the following settings:

* `gitter.personalToken`: your Personal Access Token (required)
* `gitter.renderMarkdown`: Option to render Markdown snippets as Markdown or as a code block containing Markdown text. Defaults to AsMarkdown (optional)

## Release Notes

### 1.0.0

- Initial release of extension

### 1.0.3

- fixed closeLine not applying to all commands
- fixed missing semicolon in extension.js