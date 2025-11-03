// main.ts
import { Plugin, WorkspaceLeaf, PluginSettingTab, Setting, App } from 'obsidian';
import { WorkTrackerView } from './view';
import { WorkTrackerSettings, DEFAULT_SETTINGS } from './settings';

export const VIEW_TYPE_WORK_TRACKER = 'work-tracker-view';

export default class WorkTrackerPlugin extends Plugin {
  settings!: WorkTrackerSettings; // Add definite assignment assertion
  currentMode!: 'week' | 'month' | 'year'; // Add definite assignment assertion

  async onload() {
    await this.loadSettings();
    this.currentMode = this.settings.defaultMode;
    
    // Load CSS
    this.loadStyles();
    
    this.registerView(
      VIEW_TYPE_WORK_TRACKER, 
      (leaf: WorkspaceLeaf) => new WorkTrackerView(leaf, this)
    );
    
    this.addCommand({
      id: 'open-work-tracker',
      name: 'Open Work Tracker',
      callback: () => this.openView()
    });
    
    this.addRibbonIcon('calendar-with-checkmark', 'Open Work Tracker', () => this.openView());
    this.addSettingTab(new WorkTrackerSettingTab(this.app, this));
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  loadStyles() {
    // Add default styles programmatically
    const style = document.createElement('style');
    style.textContent = `
      .work-tracker-mode-selector {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
        padding: 10px;
        border-bottom: 1px solid var(--background-modifier-border);
      }

      .work-tracker-mode-selector button {
        padding: 6px 12px;
        border: 1px solid var(--background-modifier-border);
        background: var(--background-primary);
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        color: var(--text-normal);
      }

      .work-tracker-mode-selector button:hover {
        background: var(--background-secondary);
      }

      .work-tracker-mode-selector button.active {
        background: var(--interactive-accent);
        color: var(--text-on-accent);
      }

      .work-tracker-container {
        padding: 16px;
      }
    `;
    document.head.appendChild(style);
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
      const view = leaf.view as WorkTrackerView;
      if (view && typeof view.renderHeatmap === 'function') {
        view.renderHeatmap();
      }
    });
  }
}

// Settings Tab
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

    // Color Settings
    this.plugin.settings.colors.forEach((color: string, index: number) => {
      new Setting(containerEl)
        .setName(`Activity Color ${index + 1}`)
        .setDesc(`Color for activity level ${index + 1}`)
        .addColorPicker((picker) => {
          picker.setValue(color);
          picker.onChange(async (value) => {
            this.plugin.settings.colors[index] = value;
            await this.plugin.saveSettings();
            this.plugin.refreshHeatmap();
          });
        });
    });

    // View Settings
    new Setting(containerEl)
      .setName('Default View Mode')
      .setDesc('Default mode when opening the work tracker')
      .addDropdown((dropdown) => {
        dropdown
          .addOption('week', 'Week')
          .addOption('month', 'Month')
          .addOption('year', 'Year')
          .setValue(this.plugin.settings.defaultMode)
          .onChange(async (value: string) => {
            this.plugin.settings.defaultMode = value as 'week' | 'month' | 'year';
            await this.plugin.saveSettings();
            this.plugin.currentMode = value as 'week' | 'month' | 'year';
            this.plugin.refreshHeatmap();
          });
      });

    // Advanced Settings - Add more settings controls here
    new Setting(containerEl)
      .setName('Show Edit Counts')
      .setDesc('Show exact edit counts in tooltips')
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.showEditCounts)
          .onChange(async (value: boolean) => {
            this.plugin.settings.showEditCounts = value;
            await this.plugin.saveSettings();
            this.plugin.refreshHeatmap();
          });
      });

    new Setting(containerEl)
      .setName('Cell Size')
      .setDesc('Size of each heatmap cell in pixels')
      .addSlider((slider) => {
        slider
          .setLimits(8, 20, 1)
          .setValue(this.plugin.settings.heatmapCellSize)
          .onChange(async (value: number) => {
            this.plugin.settings.heatmapCellSize = value;
            await this.plugin.saveSettings();
            this.plugin.refreshHeatmap();
          })
          .setDynamicTooltip();
      });

    new Setting(containerEl)
      .setName('Track All File Types')
      .setDesc('Track edits in all file types, not just markdown')
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.trackAllFileTypes)
          .onChange(async (value: boolean) => {
            this.plugin.settings.trackAllFileTypes = value;
            await this.plugin.saveSettings();
            this.plugin.refreshHeatmap();
          });
      });
  }
}
