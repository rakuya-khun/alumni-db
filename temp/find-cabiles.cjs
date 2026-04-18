// Find all rows containing "Cabiles" in the EE CSV
const fs = require('fs');
const data = fs.readFileSync(__dirname + '/Raw Data for Alumni Database - EE.csv', 'utf8');

function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        row.push(field);
        field = '';
      } else if (ch === '\n' || (ch === '\r' && text[i + 1] === '\n')) {
        if (ch === '\r') i++;
        row.push(field);
        field = '';
        rows.push(row);
        row = [];
      } else {
        field += ch;
      }
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

const records = parseCSV(data);
console.log('Total rows (incl header):', records.length);
console.log('Header col count:', records[0].length);
console.log('');
console.log('Col[2] header:', JSON.stringify((records[0][2] || '').substring(0, 100)));
console.log('Col[3] header:', JSON.stringify((records[0][3] || '').substring(0, 100)));
console.log('Col[37] header:', JSON.stringify((records[0][37] || '').substring(0, 100)));
console.log('Col[45] header:', JSON.stringify((records[0][45] || '').substring(0, 100)));
console.log('---');

let count = 0;
for (let i = 1; i < records.length; i++) {
  const row = records[i];
  const rowStr = row.join('|||').toLowerCase();
  if (rowStr.includes('cabiles')) {
    count++;
    console.log('=== DATA ROW ' + i + ' (of ' + (records.length - 1) + ' data rows) ===');
    console.log('  Col[0] (Timestamp):', JSON.stringify(row[0]));
    console.log('  Col[2] (status):', JSON.stringify(row[2]));
    console.log('  Col[3] (update full name):', JSON.stringify(row[3]));
    console.log('  Col[37] (new full name):', JSON.stringify(row[37]));
    console.log('  Col[45] (year grad new):', JSON.stringify(row[45]));
    console.log('  --- All cols with "cabiles" ---');
    for (let c = 0; c < row.length; c++) {
      if (row[c] && row[c].toLowerCase().includes('cabiles')) {
        console.log('    Col[' + c + ']:', JSON.stringify(row[c]));
      }
    }
    // Also dump all non-empty cols to see differences
    console.log('  --- All non-empty cols ---');
    for (let c = 0; c < row.length; c++) {
      if (row[c] && row[c].trim()) {
        console.log('    Col[' + c + ']: ' + JSON.stringify(row[c]));
      }
    }
    console.log('');
  }
}
console.log('Total rows containing "Cabiles":', count);
