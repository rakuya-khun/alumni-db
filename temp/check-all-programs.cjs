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

for (const [name, file, fjUpdate, chUpdate, fjNew, chNew] of [
  ['CE', 'temp/Raw Data for Alumni Database - CE.csv', 29, 30, 80, 81],
  ['CPE', 'temp/Raw Data for Alumni Database - CPE.csv', 28, 29, 78, 79],
  ['EE', 'temp/Raw Data for Alumni Database - EE.csv', 29, 30, 81, 82],
]) {
  console.log(`\n========== ${name} ==========`);
  const raw = fs.readFileSync(file, 'utf8');
  const rows = parseCSV(raw);
  const headers = rows[0];
  
  console.log(`  Update first_job col [${fjUpdate}]: "${(headers[fjUpdate]||'').substring(0,50)}"`);
  console.log(`  Update challenges col [${chUpdate}]: "${(headers[chUpdate]||'').substring(0,50)}"`);
  console.log(`  New first_job col [${fjNew}]: "${(headers[fjNew]||'').substring(0,50)}"`);
  console.log(`  New challenges col [${chNew}]: "${(headers[chNew]||'').substring(0,50)}"`);
  
  let updateOnly = 0, newOnly = 0, both = 0, neither = 0;
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length < 10) continue;
    const hasUpdate = !!(row[fjUpdate] && row[fjUpdate].trim()) || !!(row[chUpdate] && row[chUpdate].trim());
    const hasNew = !!(row[fjNew] && row[fjNew].trim()) || !!(row[chNew] && row[chNew].trim());
    if (hasUpdate && !hasNew) updateOnly++;
    else if (!hasUpdate && hasNew) newOnly++;
    else if (hasUpdate && hasNew) both++;
    else neither++;
  }
  console.log(`  Update section only: ${updateOnly}`);
  console.log(`  New section only: ${newOnly}`);
  console.log(`  Both sections: ${both}`);
  console.log(`  Neither: ${neither}`);
  
  // Show a few "Update only" rows if they exist
  if (updateOnly > 0) {
    console.log('\n  Sample "Update only" rows:');
    let shown = 0;
    for (let r = 1; r < rows.length && shown < 3; r++) {
      const row = rows[r];
      if (!row || row.length < 10) continue;
      const hasUpdate = !!(row[fjUpdate] && row[fjUpdate].trim()) || !!(row[chUpdate] && row[chUpdate].trim());
      const hasNew = !!(row[fjNew] && row[fjNew].trim()) || !!(row[chNew] && row[chNew].trim());
      if (hasUpdate && !hasNew) {
        console.log(`    Row ${r}: fjMethod="${(row[fjUpdate]||'').substring(0,40)}" challenges="${(row[chUpdate]||'').substring(0,40)}" | NEW: fj="${(row[fjNew]||'').substring(0,20)}" ch="${(row[chNew]||'').substring(0,20)}"`);
        shown++;
      }
    }
  }
}
