const fs = require('fs');

function parseCSVHeaders(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const headerLine = raw.split(/\r?\n/)[0];
  
  const headers = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < headerLine.length; i++) {
    const c = headerLine[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      headers.push(current.trim());
      current = '';
    } else {
      current += c;
    }
  }
  headers.push(current.trim());
  return headers;
}

const files = [
  'temp/Raw Data for Alumni Database - CE.csv',
  'temp/Raw Data for Alumni Database - CPE.csv',
  'temp/Raw Data for Alumni Database - EE.csv',
];

for (const file of files) {
  const name = file.split(' - ')[1];
  console.log(`\n=== ${name} ===`);
  const headers = parseCSVHeaders(file);
  console.log(`Total headers: ${headers.length}`);
  
  // Find headers related to first job or challenges
  headers.forEach((h, idx) => {
    const lower = h.toLowerCase();
    if (lower.includes('first job') || lower.includes('challenge') || lower.includes('obtain')) {
      console.log(`  [${idx}] ${h}`);
    }
  });
  
  // Also find duplicates (same header resolved to same column)
  const seen = new Map();
  headers.forEach((h, idx) => {
    const key = h.toLowerCase().trim();
    if (seen.has(key)) {
      console.log(`  DUPLICATE: [${seen.get(key)}] and [${idx}] = "${h}"`);
    } else {
      seen.set(key, idx);
    }
  });
}
