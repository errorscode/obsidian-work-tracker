import { ItemView, WorkspaceLeaf } from 'obsidian';
import WorkTrackerPlugin from './main';
import { VIEW_TYPE_WORK_TRACKER } from './main';
import { buildHeatmapSVG } from './heatmap';

export class WorkTrackerView extends ItemView {
    plugin: WorkTrackerPlugin;
    containerEl: HTMLElement;

    constructor(leaf: WorkspaceLeaf, plugin: WorkTrackerPlugin) {
        super(leaf);
        this.plugin = plugin;
        this.containerEl = this.contentEl;
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
        const selector = this.containerEl.createEl('div', { cls: 'work-tracker-mode-selector' });
        ['week', 'month', 'year'].forEach(mode => {
            const btn = selector.createEl('button', { text: mode[0].toUpperCase() + mode.slice(1) });
            btn.addEventListener('click', () => {
                this.plugin.currentMode = mode as 'week' | 'month' | 'year';
                this.renderHeatmap();
            });
        });
    }

    renderHeatmap() {
        // Clear existing heatmap (keep mode selector intact)
        const existingSvg = this.containerEl.querySelector('svg');
        if (existingSvg) existingSvg.remove();

        // Get activity data (example: count edits per day from your vault)
        const activity: Record<string, number> = this.getActivityData();

        const svg = buildHeatmapSVG(activity, this.plugin.settings.colors, this.plugin.currentMode);
        this.containerEl.insertAdjacentHTML('beforeend', svg);
    }

    getActivityData(): Record<string, number> {
        const data: Record<string, number> = {};
        const files = this.app.vault.getFiles().filter(f => f.extension === 'md');
        files.forEach(f => {
            const modDate = f.stat.mtime; // last modified timestamp in ms
            const d = new Date(modDate);
            const iso = d.toISOString().slice(0, 10);
            if (!data[iso]) data[iso] = 0;
            data[iso]++;
        });
        return data;
    }
}
