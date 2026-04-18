// Detailed look at the CPE Cabiles row
const fs = require('fs');
const path = require('path');

function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { field += ch; }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === ',') { row.push(field); field = ''; }
      else if (ch === '\n' || (ch === '\r' && text[i + 1] === '\n')) {
        if (ch === '\r') i++;
        row.push(field); field = '';
        rows.push(row); row = [];
      } else { field += ch; }
    }
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const data = fs.readFileSync(path.join(__dirname, 'Raw Data for Alumni Database - CPE.csv'), 'utf8');
const records = parseCSV(data);

console.log('CPE header col count:', records[0].length);
console.log('');

// Find all name-related headers
for (let c = 0; c < records[0].length; c++) {
  const h = (records[0][c] || '').toLowerCase();
  if (h.includes('name') || h.includes('status') || h.includes('year') || h.includes('program') || h.includes('course')) {
    console.log('  Col[' + c + '] header:', JSON.stringify(records[0][c].substring(0, 120)));
  }
}

console.log('');
console.log('=== CPE Row 6 - all non-empty cols ===');
const row = records[6];
for (let c = 0; c < row.length; c++) {
  if (row[c] && row[c].trim()) {
    console.log('  Col[' + c + ']: ' + JSON.stringify(row[c]));
  }
}
// Also search around the name columns
console.log('');
console.log('=== ALL rows with cabiles in CPE ===');
for (let i = 1; i < records.length; i++) {
  if (records[i].join('|||').toLowerCase().includes('cabiles')) {
    console.log('Row', i, 'all non-empty:');
    for (let c = 0; c < records[i].length; c++) {
      if (records[i][c] && records[i][c].trim()) {
        console.log('  Col[' + c + ']: ' + JSON.stringify(records[i][c]));
      }
    }
  }
}
