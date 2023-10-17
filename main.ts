import { Plugin, WorkspaceItem } from 'obsidian';

declare module "obsidian" {
	interface App {
		commands: Commands
	}

	interface Commands {
		/**
		 * Reference to App
		 */
		app: App;

		/**
		 * Commands *without* editor callback, will always be available in the command palette
		 * @example `app:open-vault` or `app:reload`
		 */
		commands: Record<string, Command>;
		/**
		 * Commands *with* editor callback, will only be available when editor is active and callback returns true
		 * @example `editor:fold-all` or `command-palette:open`
		 */
		editorCommands: Record<string, Command>;
		/**
		 * Add a command to the command registry
		 * @param command Command to add
		 */
		addCommand: (command: Command) => void;
		/**
		 * Execute a command by reference
		 * @param command Command to execute
		 */
		executeCommand: (command: Command) => boolean;
		/**
		 * Execute a command by ID
		 * @param commandId ID of command to execute
		 */
		executeCommandById: (commandId: string) => boolean;
		/**
		 * Find a command by ID
		 * @param commandId
		 */
		findCommand: (commandId: string) => Command | undefined;
		/**
		 * Lists **all** commands, both with and without editor callback
		 */
		listCommands: () => Command[];
		/**
		 * Remove a command from the command registry
		 * @param commandId Command to remove
		 */
		removeCommand: (commandId: string) => void;
	}

	interface WorkspaceItem {
		parent: WorkspaceItem
		type: String
	}
}

export default class ObsidianMoveTabs extends Plugin {
	async onload() {
		['left', 'right', 'bottom', 'top'].forEach(direction => {
			this.addCommand({
				id: `move-tab-${direction}`,
				name: `Move active tab towards the ${direction}`,
				callback: () => {
					const ws = this.app.workspace;

					const toMove = ws.getLeaf(false);

					this.app.commands.executeCommandById(`editor:focus-${direction}`);
					let moveTo: WorkspaceItem = ws.getLeaf(false);

					if (moveTo === toMove) {
						console.log(`No new active leaf to the ${direction}. Abort`);
						return;
					}

					while (moveTo && moveTo.type !== 'tabs') {
						moveTo = moveTo.parent;
					}

					if (!moveTo) {
						console.error('Failed to find tabs in ancestor chain of focused leaf')
						return;
					}

					const newTab = ws.getLeaf('tab');
					ws.setActiveLeaf(newTab);
					ws.duplicateLeaf(toMove, false).then(leaf => {
						leaf.setViewState(toMove.getViewState(), toMove.getEphemeralState());
						toMove.detach();
					});
				}
			})
		});
	}

	onunload() {

	}
}
