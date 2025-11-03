// settings.ts
export interface WorkTrackerSettings {
    // Display Settings
    colors: string[];
    defaultMode: 'week' | 'month' | 'year';
    showEditCounts: boolean;
    showCurrentDayHighlight: boolean;
    currentDayHighlightColor: string;
    
    // Color Configuration
    colorThresholds: {
        low: number;
        medium: number;
        high: number;
    };
    useCustomThresholds: boolean;
    
    // File Tracking
    excludeFileTypes: string[];
    includeFileTypes: string[];
    excludePaths: string[];
    trackCreationDates: boolean;
    trackModificationDates: boolean;
    trackAllFileTypes: boolean;
    
    // Heatmap Appearance
    heatmapCellSize: number;
    heatmapCellGap: number;
    heatmapRounding: number;
    showMonthLabels: boolean;
    showDayLabels: boolean;
    
    // Behavior
    autoRefreshInterval: number;
    weekStartsOn: 'sunday' | 'monday';
    rememberLastView: boolean;
    defaultViewPosition: 'right' | 'left' | 'center';
    
    // Advanced
    debugMode: boolean;
    dataRetentionDays: number;
}

export const DEFAULT_SETTINGS: WorkTrackerSettings = {
    // Display Settings
    colors: ['#ebedf0', '#c6e48b', '#7bc96f', '#196127'],
    defaultMode: 'year',
    showEditCounts: true,
    showCurrentDayHighlight: true,
    currentDayHighlightColor: '#ff6b6b',
    
    // Color Configuration
    colorThresholds: {
        low: 1,
        medium: 3,
        high: 5
    },
    useCustomThresholds: false,
    
    // File Tracking
    excludeFileTypes: [],
    includeFileTypes: ['md'],
    excludePaths: [],
    trackCreationDates: true,
    trackModificationDates: true,
    trackAllFileTypes: false,
    
    // Heatmap Appearance
    heatmapCellSize: 12,
    heatmapCellGap: 4,
    heatmapRounding: 2,
    showMonthLabels: true,
    showDayLabels: false,
    
    // Behavior
    autoRefreshInterval: 5,
    weekStartsOn: 'sunday',
    rememberLastView: true,
    defaultViewPosition: 'right',
    
    // Advanced
    debugMode: false,
    dataRetentionDays: 365
};
