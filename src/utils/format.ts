export const formatNumber = (num: number): string => {
  return num.toFixed(2);
};

export const convertToCSV = (columns: string[], rows: Record<string, unknown>[]): string => {
  
  const header = columns.join(',');
  
  
  const csvRows = rows.map(row => {
    return columns.map(column => {
     
      const value = String(row[column] || '');
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  });
  

  return [header, ...csvRows].join('\n');
};

export const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};