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

const files = [
  ['CPE', 'temp/Raw Data for Alumni Database - CPE.csv'],
  ['EE', 'temp/Raw Data for Alumni Database - EE.csv'],
];

for (const [name, file] of files) {
  const raw = fs.readFileSync(file, 'utf8');
  const rows = parseCSV(raw);
  
  // Count by status
  const counts = {};
  for (let r = 1; r < rows.length; r++) {
    const s = rows[r][2] || '(empty)';
    counts[s] = (counts[s] || 0) + 1;
  }
  console.log(`\n=== ${name}: Status distribution (${rows[0].length} cols, ${rows.length-1} data rows) ===`);
  for (const [k, v] of Object.entries(counts)) {
    console.log(`  "${k}": ${v}`);
  }
  
  // Find an Update row
  for (let r = 1; r < rows.length; r++) {
    const status = rows[r][2];
    if (status && status.toLowerCase().includes('update')) {
      console.log(`\n--- ${name} Row ${r} (Update Alumni) ---`);
      rows[r].forEach((val, i) => {
        const display = val ? val.substring(0, 100) : '(empty)';
        console.log(`  [${i}] ${display}`);
      });
      break;
    }
  }
}
