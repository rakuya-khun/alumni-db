const fs = require('fs');

// Proper CSV parser that handles multi-line quoted fields
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
          i++; // skip escaped quote
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
        if (c === '\r') i++; // skip \r in \r\n
        current.push(field.trim());
        rows.push(current);
        current = [];
        field = '';
      } else {
        field += c;
      }
    }
  }
  // Push last field/row
  if (field || current.length > 0) {
    current.push(field.trim());
    rows.push(current);
  }
  return rows;
}

const files = [
  ['CE', 'temp/Raw Data for Alumni Database - CE.csv'],
  ['CPE', 'temp/Raw Data for Alumni Database - CPE.csv'],
  ['EE', 'temp/Raw Data for Alumni Database - EE.csv'],
];

for (const [name, file] of files) {
  console.log(`\n========== ${name} ==========`);
  const raw = fs.readFileSync(file, 'utf8');
  const rows = parseCSV(raw);
  const headers = rows[0] || [];
  console.log(`Total headers: ${headers.length}`);
  console.log(`Data rows: ${rows.length - 1}`);
  
  // Show ALL headers with index
  console.log('\n--- ALL HEADERS ---');
  headers.forEach((h, idx) => {
    // Shorten display to first 100 chars
    const display = h.length > 100 ? h.substring(0, 100) + '...' : h;
    console.log(`  [${idx}] ${display}`);
  });
  
  // Find headers related to first job, challenges, obtain
  console.log('\n--- MATCHING: first job / challenge / obtain ---');
  headers.forEach((h, idx) => {
    const lower = h.toLowerCase();
    if (lower.includes('first job') || lower.includes('challenge') || lower.includes('obtain')) {
      console.log(`  [${idx}] ${h}`);
    }
  });
  
  // Find exact duplicates
  console.log('\n--- EXACT DUPLICATE HEADERS ---');
  const seen = new Map();
  headers.forEach((h, idx) => {
    const key = h.toLowerCase().trim();
    if (seen.has(key)) {
      console.log(`  DUP: col [${seen.get(key)}] and [${idx}] = "${h.substring(0, 80)}..."`);
    } else {
      seen.set(key, idx);
    }
  });
}
