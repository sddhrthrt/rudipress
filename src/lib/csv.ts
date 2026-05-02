/**
 * Simple CSV parser for zine data
 * Handles basic CSV format with header row
 */

/**
 * Parse a CSV string into an array of objects
 * @param csvContent - The raw CSV string
 * @returns Array of objects with keys from header row
 */
export function parseCSV(csvContent: string): Record<string, string>[] {
  const lines = csvContent.trim().split('\n');
  
  if (lines.length < 2) {
    return [];
  }
  
  // Parse header row
  const headers = lines[0].split(',').map(h => h.trim());
  
  // Parse data rows
  const rows: Record<string, string>[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split(',');
    const row: Record<string, string> = {};
    
    headers.forEach((header, index) => {
      // Handle empty values - default to empty string
      row[header] = values[index]?.trim() || '';
    });
    
    rows.push(row);
  }
  
  return rows;
}

/**
 * Parse a CSV file from the data directory
 * Uses import.meta.glob to read the file content
 */
export async function parseCSVFile(filePath: string): Promise<Record<string, string>[]> {
  // Get all CSV files from data directory
  const modules = import.meta.glob('../data/*.csv', { query: '?raw', eager: true });
  
  const fileName = filePath.split('/').pop();
  const matchedModule = modules[`../data/${fileName}`];
  
  if (!matchedModule) {
    throw new Error(`CSV file not found: ${filePath}`);
  }
  
  const csvContent = (matchedModule as { default: string }).default;
  return parseCSV(csvContent);
}