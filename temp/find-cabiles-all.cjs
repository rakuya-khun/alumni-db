// Check all 3 CSVs for "Cabiles"
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

const files = [
  'Raw Data for Alumni Database - CE.csv',
  'Raw Data for Alumni Database - CPE.csv',
  'Raw Data for Alumni Database - EE.csv',
];

for (const file of files) {
  const data = fs.readFileSync(path.join(__dirname, file), 'utf8');
  const records = parseCSV(data);
  let count = 0;
  for (let i = 1; i < records.length; i++) {
    if (records[i].join('|||').toLowerCase().includes('cabiles')) {
      count++;
      console.log(file, '- Row', i, ':', JSON.stringify(records[i][2]), JSON.stringify(records[i][3] || ''), JSON.stringify(records[i][37] || ''));
    }
  }
  if (count === 0) console.log(file, '- No Cabiles rows found');
}
