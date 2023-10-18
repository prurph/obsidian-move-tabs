import { App, Plugin, PluginSettingTab, Setting, WorkspaceLeaf, WorkspaceItem } from 'obsidian';

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
		type: string
	}
}

interface Hint {
	el: HTMLElement,
	leaf: WorkspaceLeaf
}

interface Settings {
	hintCodes: string
}

const DEFAULT_SETTINGS: Settings = {
	hintCodes: 'asdfghjkl;'
}

export default class MoveTabs extends Plugin {
	hints: { [key: string]: Hint } = {};
	settings: Settings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: `move-with-hints`,
			name: 'Move active tab by hints',
			callback: () => {
				const ws = this.app.workspace;
				const toMove = ws.getLeaf(false);

				if (!toMove) return false;

				ws.getLeavesOfType('markdown').forEach((leaf, i) => {
					if (leaf === toMove || i >= this.settings.hintCodes.length) return;
					const el = leaf.tabHeaderEl.createEl(
						'div',
						{ text: this.settings.hintCodes[i].toUpperCase(), cls: ['movetabs-hint'], prepend: true }
					);
					this.hints[this.settings.hintCodes[i]] = { el, leaf };
				});

				const containerEl = this.app.workspace.containerEl;

				const handleKeyDown = (event: KeyboardEvent) => {
					event.preventDefault();
					event.stopPropagation();
					event.stopImmediatePropagation();

					const activated = this.hints[event.key.toLowerCase()];

					if (activated) {
						ws.setActiveLeaf(activated.leaf);
						ws.setActiveLeaf(ws.getLeaf('tab'));
						ws.duplicateLeaf(toMove, false).then(leaf => {
							leaf.setViewState(toMove.getViewState(), toMove.getEphemeralState());
							toMove.detach();
						});
					};

					containerEl.removeEventListener('keydown', handleKeyDown, { capture: true });
					this.clearHints();
					return;
				}

				const reset = () => {
					containerEl.removeEventListener('keydown', handleKeyDown, { capture: true });
					this.clearHints();
				}

				containerEl.addEventListener('keydown', handleKeyDown, { capture: true });
				containerEl.addEventListener('mouseclick', reset);
				this.registerEvent(this.app.workspace.on('active-leaf-change', reset));
			}
		});

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

		this.addSettingTab(new SettingTab(this.app, this));
	}

	onunload() {
		Object.values(this.hints).forEach(hint => {
			hint.el.remove();
		})
	}

	clearHints() {
		Object.values(this.hints).forEach(hint => hint.el.remove());
		this.hints = {};
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, this.loadData())
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SettingTab extends PluginSettingTab {
	plugin: MoveTabs;

	constructor(app: App, plugin: MoveTabs) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Hint codes')
			.setDesc('Characters to use as popup hints for tab movement, e.g. abcdefgh')
			.addText(text => text
				.setPlaceholder('asdfghjkl;')
				.setValue(this.plugin.settings.hintCodes)
				.onChange(async (value) => {
					this.plugin.settings.hintCodes = value;
					await this.plugin.saveSettings();
				}));
	}
}