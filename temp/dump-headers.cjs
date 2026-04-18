const fs = require('fs');

function parseCSV(text) {
  const rows = [];
  let current = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (i + 1 < text.length && text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ',') {
        current.push(field.trim());
        field = '';
      } else if (c === '\n' || (c === '\r' && text[i + 1] === '\n')) {
        if (c === '\r') i++;
        current.push(field.trim());
        rows.push(current);
        current = [];
        field = '';
      } else {
        field += c;
      }
    }
  }
  if (field || current.length > 0) {
    current.push(field.trim());
    rows.push(current);
  }
  return rows;
}

const raw = fs.readFileSync('temp/Raw Data for Alumni Database - CE.csv', 'utf8');
const rows = parseCSV(raw);
const headers = rows[0];

console.log('=== TOTAL COLUMNS:', headers.length, '===');
console.log('=== TOTAL DATA ROWS:', rows.length - 1, '===\n');

console.log('=== ALL HEADERS ===');
headers.forEach((h, i) => {
  console.log(`[${i}] ${h.substring(0, 150)}`);
});

// Show data rows 10-12 (0-indexed rows 10,11,12 = CSV lines ~11-13)
console.log('\n=== DATA ROWS 10-12 (sample) ===');
for (let r = 10; r <= 12 && r < rows.length; r++) {
  console.log(`\n--- Row ${r} ---`);
  rows[r].forEach((val, i) => {
    const display = val ? val.substring(0, 80) : '(empty)';
    console.log(`  [${i}] ${display}`);
  });
}
