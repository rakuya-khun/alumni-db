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

// Simulate mapSheetRowToAlumni for the first_job cols
const raw = fs.readFileSync('temp/Raw Data for Alumni Database - CE.csv', 'utf8');
const rows = parseCSV(raw);
const headers = rows[0];

console.log('=== CE: first 5 New Alumni rows - raw values for first_job cols ===\n');

// CE: Update cols [29,30], New cols [80,81]
for (let r = 1; r <= Math.min(5, rows.length - 1); r++) {
  const row = rows[r];
  console.log(`Row ${r}:`);
  console.log(`  [29] Update first_job: ${JSON.stringify(row[29])}`);
  console.log(`  [30] Update challenges: ${JSON.stringify(row[30])}`);
  console.log(`  [80] New first_job: ${JSON.stringify(row[80])}`);
  console.log(`  [81] New challenges: ${JSON.stringify(row[81])}`);
  
  // Simulate mapper: left-to-right order
  let first_job_method = null;
  let job_challenges = null;
  
  // Col 29 resolves to first_job_method
  let v29 = row[29] ?? null;
  if (v29 !== null) first_job_method = v29;
  
  // Col 30 resolves to job_challenges  
  let v30 = row[30] ?? null;
  if (v30 !== null) job_challenges = v30;
  
  // Col 80 resolves to first_job_method (overwrite check)
  let v80 = row[80] ?? null;
  // Guard: if (value === null && result[column] != null) continue
  if (v80 === null && first_job_method != null) { /* skip */ }
  else first_job_method = v80;
  
  // Col 81 resolves to job_challenges (overwrite check)
  let v81 = row[81] ?? null;
  if (v81 === null && job_challenges != null) { /* skip */ }
  else job_challenges = v81;
  
  console.log(`  → Mapper result: first_job_method=${JSON.stringify(first_job_method)}, job_challenges=${JSON.stringify(job_challenges)}`);
  console.log();
}
