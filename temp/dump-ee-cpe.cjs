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
        if (i + 1 < text.length && text[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
      } else { field += c; }
    } else {
      if (c === '"') { inQuotes = true; }
      else if (c === ',') { current.push(field.trim()); field = ''; }
      else if (c === '\n' || (c === '\r' && text[i + 1] === '\n')) {
        if (c === '\r') i++;
        current.push(field.trim());
        rows.push(current);
        current = [];
        field = '';
      } else { field += c; }
    }
  }
  if (field || current.length > 0) { current.push(field.trim()); rows.push(current); }
  return rows;
}

// EE: show an Update row
const eeRaw = fs.readFileSync('temp/Raw Data for Alumni Database - EE.csv', 'utf8');
const eeRows = parseCSV(eeRaw);

console.log('=== EE HEADERS ===');
eeRows[0].forEach((h, i) => console.log(`[${i}] ${h.substring(0, 130)}`));

for (let r = 1; r < eeRows.length; r++) {
  if (eeRows[r][2] && eeRows[r][2].toLowerCase().includes('updat')) {
    console.log(`\n=== EE Row ${r} (Updating Records) ===`);
    eeRows[r].forEach((val, i) => {
      const display = val ? val.substring(0, 100) : '(empty)';
      console.log(`  [${i}] ${display}`);
    });
    break;
  }
}

// CPE: show headers
const cpeRaw = fs.readFileSync('temp/Raw Data for Alumni Database - CPE.csv', 'utf8');
const cpeRows = parseCSV(cpeRaw);
console.log('\n=== CPE HEADERS ===');
cpeRows[0].forEach((h, i) => console.log(`[${i}] ${h.substring(0, 130)}`));

// First CPE data row
console.log('\n=== CPE Row 1 (first data) ===');
cpeRows[1].forEach((val, i) => {
  const display = val ? val.substring(0, 100) : '(empty)';
  console.log(`  [${i}] ${display}`);
});
