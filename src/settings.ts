export interface WorkTrackerSettings {
    colors: string[];
    defaultMode: 'week' | 'month' | 'year';
}

export const DEFAULT_SETTINGS: WorkTrackerSettings = {
    colors: ['#ebedf0', '#c6e48b', '#7bc96f', '#196127'],
    defaultMode: 'year'
};
