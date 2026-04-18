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
        if (i + 1 < text.length && text[i + 1] === '"') { field += '"'; i++; }
        else { inQuotes = false; }
      } else { field += c; }
    } else {
      if (c === '"') { inQuotes = true; }
      else if (c === ',') { current.push(field); field = ''; }
      else if (c === '\n' || (c === '\r' && text[i + 1] === '\n')) {
        if (c === '\r') i++;
        current.push(field); rows.push(current); current = []; field = '';
      } else { field += c; }
    }
  }
  if (field || current.length > 0) { current.push(field); rows.push(current); }
  return rows;
}

// Check CE data - look at first_job_method and job_challenges columns
const raw = fs.readFileSync('temp/Raw Data for Alumni Database - CE.csv', 'utf8');
const rows = parseCSV(raw);
const headers = rows[0];

// Columns of interest
const cols = [29, 30, 79, 80, 81];
console.log('Key column headers:');
cols.forEach(i => console.log(`  [${i}] ${(headers[i] || '').substring(0, 60)}`));

console.log('\n--- First 10 data rows, showing cols 29,30 (Update) vs 80,81 (New) ---');
console.log('Row | Update first_job [29] | Update challenges [30] | New first_job [80] | New challenges [81]');
for (let r = 1; r <= Math.min(10, rows.length - 1); r++) {
  const row = rows[r];
  const v29 = (row[29] || '').substring(0, 30);
  const v30 = (row[30] || '').substring(0, 30);
  const v80 = (row[80] || '').substring(0, 30);
  const v81 = (row[81] || '').substring(0, 30);
  console.log(`${r.toString().padStart(3)} | "${v29}" | "${v30}" | "${v80}" | "${v81}"`);
}

// Count: how many rows have data in Update section but not New section for these cols
let updateOnly = 0, newOnly = 0, both = 0, neither = 0;
for (let r = 1; r < rows.length; r++) {
  const row = rows[r];
  const hasUpdate = !!(row[29] && row[29].trim()) || !!(row[30] && row[30].trim());
  const hasNew = !!(row[80] && row[80].trim()) || !!(row[81] && row[81].trim());
  if (hasUpdate && !hasNew) updateOnly++;
  else if (!hasUpdate && hasNew) newOnly++;
  else if (hasUpdate && hasNew) both++;
  else neither++;
}
console.log(`\nData distribution (CE):
  Update section only: ${updateOnly}
  New section only: ${newOnly}
  Both sections: ${both}
  Neither: ${neither}`);
