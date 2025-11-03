// heatmap.ts - Updated to use settings
import { WorkTrackerSettings } from './settings';

function dateToISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function getPastDates(days: number) {
  const dates = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(d);
  }
  return dates;
}

function colorForCount(count: number, settings: WorkTrackerSettings): string {
  if (count <= 0) return settings.colors[0];
  if (count <= settings.colorThresholds.low) return settings.colors[1];
  if (count <= settings.colorThresholds.medium) return settings.colors[2];
  return settings.colors[3];
}

export function buildHeatmapSVG(
  activity: Record<string, number>, 
  settings: WorkTrackerSettings, 
  mode: 'week' | 'month' | 'year' = 'year'
) {
  let dates: Date[] = [];
  
  if (mode === 'week') dates = getPastDates(7);
  else if (mode === 'month') dates = getPastDates(30);
  else dates = getPastDates(365);

  // Build weeks for columns (Sunday = 0)
  const weeks: Date[][] = [];
  let week: Date[] = [];
  
  dates.forEach(d => {
    week.push(d);
    if (d.getDay() === 6) {
      weeks.push(week);
      week = [];
    }
  });
  
  if (week.length) weeks.push(week);

  const cellSize = settings.heatmapCellSize;
  const cellGap = settings.heatmapCellGap;
  const rounding = settings.heatmapRounding;
  
  const width = weeks.length * (cellSize + cellGap);
  const height = 7 * (cellSize + cellGap);
  
  let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;
  
  weeks.forEach((w, wi) => {
    w.forEach((d, di) => {
      const x = wi * (cellSize + cellGap);
      const y = di * (cellSize + cellGap);
      const ds = dateToISO(d);
      const count = activity[ds] || 0;
      const color = colorForCount(count, settings);
      
      // Only show title if enabled in settings
      const title = settings.showEditCounts 
        ? `${ds}: ${count} edit${count === 1 ? '' : 's'}`
        : ds;
      
      svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="${rounding}" ry="${rounding}" fill="${color}">`;
      svg += `<title>${title}</title></rect>`;
    });
  });
  
  svg += `</svg>`;
  return svg;
}
