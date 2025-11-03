// view.ts
import { ItemView, WorkspaceLeaf } from 'obsidian';
import WorkTrackerPlugin from './main';
import { VIEW_TYPE_WORK_TRACKER } from './main';
import { buildHeatmapSVG } from './heatmap';

export class WorkTrackerView extends ItemView {
  plugin: WorkTrackerPlugin;

  constructor(leaf: WorkspaceLeaf, plugin: WorkTrackerPlugin) {
    super(leaf);
    this.plugin = plugin;
    this.containerEl.addClass('work-tracker-container');
  }

  getViewType(): string {
    return VIEW_TYPE_WORK_TRACKER;
  }

  getDisplayText(): string {
    return 'Work Tracker';
  }

  async onOpen(): Promise<void> {
    this.renderModeSelector();
    this.renderHeatmap();
  }

  async onClose(): Promise<void> {
    // Cleanup if needed
  }

  renderModeSelector() {
    const selector = this.containerEl.createEl('div', {
      cls: 'work-tracker-mode-selector'
    });

    ['week', 'month', 'year'].forEach(mode => {
      const btn = selector.createEl('button', {
        text: mode.charAt(0).toUpperCase() + mode.slice(1)
      });

      if (mode === this.plugin.currentMode) {
        btn.addClass('active');
      }

      btn.addEventListener('click', () => {
        // Remove active class from all buttons - FIXED TYPE
        selector.findAll('button').forEach((b: HTMLElement) => {
          b.removeClass('active');
        });
        // Add active class to clicked button
        btn.addClass('active');

        this.plugin.currentMode = mode as 'week' | 'month' | 'year';
        this.renderHeatmap();
      });
    });
  }

  renderHeatmap() {
    // Clear existing heatmap (keep mode selector intact)
    const existingSvg = this.containerEl.querySelector('.work-tracker-heatmap');
    if (existingSvg) {
      existingSvg.remove();
    }

    // Get activity data
    const activity: Record<string, number> = this.getActivityData();
    const svg = buildHeatmapSVG(
      activity, 
      this.plugin.settings,
      this.plugin.currentMode
    );
    
    // Create container for heatmap
    const heatmapContainer = this.containerEl.createEl('div', {
      cls: 'work-tracker-heatmap'
    });
    heatmapContainer.innerHTML = svg;
  }

  getActivityData(): Record<string, number> {
    const data: Record<string, number> = {};
    const files = this.app.vault.getFiles().filter(f => {
      // Use settings to filter file types
      if (this.plugin.settings.trackAllFileTypes) return true;
      return this.plugin.settings.includeFileTypes.includes(f.extension);
    });
    
    files.forEach(f => {
      // Check if file should be excluded
      if (this.plugin.settings.excludePaths.some(path => f.path.startsWith(path))) {
        return;
      }
      
      if (this.plugin.settings.excludeFileTypes.includes(f.extension)) {
        return;
      }

      let dateToUse: number | null = null;
      
      if (this.plugin.settings.trackModificationDates) {
        dateToUse = f.stat.mtime;
      }
      
      if (this.plugin.settings.trackCreationDates && !dateToUse) {
        dateToUse = f.stat.ctime;
      }
      
      if (dateToUse) {
        const d = new Date(dateToUse);
        const iso = d.toISOString().slice(0, 10);
        
        if (!data[iso]) {
          data[iso] = 0;
        }
        data[iso]++;
      }
    });
    
    return data;
  }
}
