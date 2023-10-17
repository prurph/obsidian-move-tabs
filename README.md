# Obsidian Move Tabs

This plugin adds commands to move the currently focused editor tab to the pane to its left, right, bottom, or top. If no such pane exists, nothing will happen.

It's mostly for my own use so install at your own risk. PRs or suggestions welcome!

## Installation

1. Clone this repo into your `<vault>/.obsidian/plugins` directory
2. Enable the plugin: `preferences → Community plugins → toggle slider for "Move Tabs"`
3. (Optional) bind hotkeys to the commands.

## Known issues

- The command palette always displays all four options, even if there is no pane in a given direction
  - I attempted to prevent this using `checkCallback` and comparing the focused node and the one in the given direction, however specifically when in `checking` mode, the focus commands seem to behave differently and "wrap" to other tabs in the pane.
  - The upshot was trying to detect whether the active leaf was at the edge of a pane by trying to focus in that direction and seeing if a new leaf was focused afterwards did not work when `checking`. Various cludges were unsuccessful.
  - With great shame I simply abandoned trying to check, and always list all four commands. I bind these directly to hotkeys and never access them through the command palette anyway.
