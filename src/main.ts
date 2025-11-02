import { Plugin, WorkspaceLeaf, ItemView, App, PluginSettingTab, Setting } from 'obsidian';
import { WorkTrackerView } from './view';
import { WorkTrackerSettings, DEFAULT_SETTINGS } from './settings';
import { buildHeatmapSVG } from './heatmap';

export const VIEW_TYPE_WORK_TRACKER = 'work-tracker-view';

export default class WorkTrackerPlugin extends Plugin {
settings!: WorkTrackerSettings;
currentMode!: 'week' | 'month' | 'year';


    async onload() {
        await this.loadSettings();
        this.currentMode = this.settings.defaultMode;

        this.registerView(VIEW_TYPE_WORK_TRACKER, (leaf: WorkspaceLeaf) => new WorkTrackerView(leaf, this));

        this.addCommand({
            id: 'open-work-tracker',
            name: 'Open Work Tracker',
            callback: () => this.openView()
        });

        this.addRibbonIcon('calendar-with-check', 'Open Work Tracker', () => this.openView());
        this.addSettingTab(new WorkTrackerSettingTab(this.app, this));
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    openView() {
        const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_WORK_TRACKER);
        if (leaves.length) {
            this.app.workspace.revealLeaf(leaves[0]);
            return;
        }
        const leaf = this.app.workspace.getRightLeaf(false);
if (leaf) {
    leaf.setViewState({ type: VIEW_TYPE_WORK_TRACKER });
}
    }

    refreshHeatmap() {
        const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_WORK_TRACKER);
        leaves.forEach((leaf: WorkspaceLeaf) => {
            (leaf.view as WorkTrackerView).renderHeatmap();
        });
    }
}

// ------------------- Settings Tab -------------------

class WorkTrackerSettingTab extends PluginSettingTab {
    plugin: WorkTrackerPlugin;

    constructor(app: App, plugin: WorkTrackerPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl('h2', { text: 'Work Tracker Settings' });

        this.plugin.settings.colors.forEach((color, index) => {
            new Setting(containerEl)
                .setName(`Activity Color ${index}`)
                .addColorPicker(picker => {
                    picker.setValue(color);
                    picker.onChange(async (value) => {
                        this.plugin.settings.colors[index] = value;
                        await this.plugin.saveSettings();
                        this.plugin.refreshHeatmap();
                    });
                });
        });

        new Setting(containerEl)
            .setName('Default View Mode')
            .addDropdown(dropdown => {
                dropdown.addOption('week', 'Week');
                dropdown.addOption('month', 'Month');
                dropdown.addOption('year', 'Year');
                dropdown.setValue(this.plugin.settings.defaultMode);
                dropdown.onChange(async (value) => {
                    this.plugin.settings.defaultMode = value as 'week' | 'month' | 'year';
                    await this.plugin.saveSettings();
                    this.plugin.currentMode = value as 'week' | 'month' | 'year';
                    this.plugin.refreshHeatmap();
                });
            });
    }
}
