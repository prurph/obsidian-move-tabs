# Obsidian Move Tabs

This plugin adds a few commands to move tabs between panes. They are:

- `move-tab-<left|right|bottom|top>`
  - Move the active tab to the pane in the indicated direction
  - If no such pane exists, no-op
- `move-with-hints`
  - Display single character hints on active tabs; when that key is pressed, move the active tab after (to the right of) of the hinted tab
  - Pressing escape, an unhinted key, or clicking cancels the hints
  - The hints are the home row on a US QWERTY keyboard `asdfjkl;`
  - Customize the characters used for hints used in settings
  - If there are more open tabs than there are hint characters, the excess tabs will not have hints
  - Supports sliding panes aka stacked tabs aka Andy Matuschak mode

## Installation

### Manual

1. Clone this repo into your `<vault>/.obsidian/plugins` directory
2. In `plugins/obisidian-move-tabs`: `npm install && npm run build`
3. Enable the plugin: `preferences → Community plugins → toggle slider for "Move Tabs"`
4. (Optional) bind hotkeys to the commands.

### Through community plugins

Not yet!

## Known issues

- The command palette always displays all four options, even if there is no pane in a given direction
  - I attempted to prevent this using `checkCallback` and comparing the focused node and the one in the given direction, however specifically when in `checking` mode, the focus commands seem to behave differently and "wrap" to other tabs in the pane.
  - Thus detecing whether the active leaf was at the edge of a pane by attempting to focus in that direction and seeing if a new leaf was focused afterwards did not work when `checking`. Various cludges were unsuccessful.
  - With great shame I simply abandoned trying to check, and always list all four commands. I personally bind these directly to hotkeys and never access them through the command palette anyway.

## Contributing

PRs welcome!
