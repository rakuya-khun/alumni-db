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

const raw = fs.readFileSync('temp/Raw Data for Alumni Database - CE.csv', 'utf8');
const rows = parseCSV(raw);

// Find rows where status = "Update Alumni"
console.log('=== Looking for Update Alumni rows ===');
for (let r = 1; r < rows.length; r++) {
  const status = rows[r][2];
  if (status && status.toLowerCase().includes('update')) {
    console.log(`\n--- Row ${r} (Update Alumni) ---`);
    rows[r].forEach((val, i) => {
      const display = val ? val.substring(0, 80) : '(empty)';
      console.log(`  [${i}] ${display}`);
    });
    break; // just show first one
  }
}

// Count by status
const counts = {};
for (let r = 1; r < rows.length; r++) {
  const s = rows[r][2] || '(empty)';
  counts[s] = (counts[s] || 0) + 1;
}
console.log('\n=== Status distribution ===');
for (const [k, v] of Object.entries(counts)) {
  console.log(`  "${k}": ${v}`);
}
