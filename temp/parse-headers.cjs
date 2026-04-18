const fs = require('fs');

function parseCSVRow(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i+1] === '"') { field += '"'; i++; }
      else if (c === '"') { inQuotes = false; }
      else { field += c; }
    } else {
      if (c === '"') { inQuotes = true; }
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i+1] === '\n') i++;
        if (!inQuotes) { row.push(field); rows.push(row); row = []; field = ''; }
        else { field += '\n'; }
      }
      else { field += c; }
    }
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

// Parse CPE
const cpeText = fs.readFileSync('temp/Raw Data for Alumni Database - CPE.csv', 'utf8');
const cpeRows = parseCSVRow(cpeText);
console.log('=== CPE HEADERS ===');
console.log('Total columns:', cpeRows[0].length);
cpeRows[0].forEach((h, i) => {
  const short = h.replace(/\n/g, ' ').substring(0, 100);
  console.log('[' + i + '] ' + short);
});
console.log('\nCPE total data rows:', cpeRows.length - 1);

console.log('\n=== EE HEADERS ===');
const eeText = fs.readFileSync('temp/Raw Data for Alumni Database - EE.csv', 'utf8');
const eeRows = parseCSVRow(eeText);
console.log('Total columns:', eeRows[0].length);
eeRows[0].forEach((h, i) => {
  const short = h.replace(/\n/g, ' ').substring(0, 100);
  console.log('[' + i + '] ' + short);
});
console.log('\nEE total data rows:', eeRows.length - 1);

// Check for Update rows in CPE
console.log('\n=== CPE STATUS COLUMN CHECK ===');
// Find which column has status info
const cpeStatusColIdx = cpeRows[0].findIndex(h => h.toLowerCase().includes('what is your status'));
console.log('CPE "What is your status?" column index:', cpeStatusColIdx);
if (cpeStatusColIdx >= 0) {
  const statusValues = {};
  for (let r = 1; r < cpeRows.length; r++) {
    const val = (cpeRows[r][cpeStatusColIdx] || '').trim();
    statusValues[val] = (statusValues[val] || 0) + 1;
  }
  console.log('CPE status distribution:', statusValues);
}

// Also check col 2 for CPE
console.log('CPE col[2] header:', cpeRows[0][2]);
const cpe2values = {};
for (let r = 1; r < Math.min(cpeRows.length, 20); r++) {
  const val = (cpeRows[r][2] || '').trim().substring(0, 40);
  cpe2values[val] = (cpe2values[val] || 0) + 1;
}
console.log('CPE col[2] first 19 data values:', cpe2values);

// Check for Update rows in EE
console.log('\n=== EE STATUS COLUMN CHECK ===');
const eeStatusColIdx = eeRows[0].findIndex(h => h.toLowerCase().includes('what is your status'));
console.log('EE "What is your status?" column index:', eeStatusColIdx);
if (eeStatusColIdx >= 0) {
  const statusValues = {};
  for (let r = 1; r < eeRows.length; r++) {
    const val = (eeRows[r][eeStatusColIdx] || '').trim();
    statusValues[val] = (statusValues[val] || 0) + 1;
  }
  console.log('EE status distribution:', statusValues);
}

// Show EE Update rows data pattern
console.log('\n=== EE UPDATE ROW DATA PATTERN ===');
for (let r = 1; r < eeRows.length; r++) {
  if ((eeRows[r][2] || '').trim() === 'Updating Records') {
    const row = eeRows[r];
    const filledCols = [];
    for (let c = 0; c < row.length; c++) {
      if (row[c] && row[c].trim()) {
        filledCols.push('[' + c + ']=' + row[c].trim().substring(0, 50));
      }
    }
    console.log('Row ' + r + ' (Update): ' + filledCols.join(' | '));
    if (filledCols.length > 0) break; // just show first one
  }
}

// Show a few more
let updateCount = 0;
for (let r = 1; r < eeRows.length; r++) {
  if ((eeRows[r][2] || '').trim() === 'Updating Records') {
    updateCount++;
    if (updateCount <= 3) {
      const row = eeRows[r];
      const nonEmpty = [];
      for (let c = 3; c <= 36; c++) {
        if (row[c] && row[c].trim()) nonEmpty.push(c);
      }
      const newAlumniNonEmpty = [];
      for (let c = 37; c <= 88; c++) {
        if (row[c] && row[c].trim()) newAlumniNonEmpty.push(c);
      }
      console.log('Update row ' + r + ': Update section filled cols:', nonEmpty, '| New Alumni section filled cols:', newAlumniNonEmpty);
    }
  }
}
console.log('Total EE Update rows:', updateCount);

// CPE: check ALL rows for any update-like pattern
console.log('\n=== CPE UPDATE ROW SEARCH ===');
let cpeUpdateCount = 0;
for (let r = 1; r < cpeRows.length; r++) {
  // Check if col 2 (first Update field) has data AND col 35 (first New Alumni field) is empty
  const col2 = (cpeRows[r][2] || '').trim();
  const col35 = (cpeRows[r][35] || '').trim();
  const statusCol = (cpeRows[r][cpeStatusColIdx] || '').trim();
  if (col2 && !col35) {
    cpeUpdateCount++;
    if (cpeUpdateCount <= 3) {
      console.log('CPE row ' + r + ': col[2]="' + col2.substring(0,40) + '" status="' + statusCol + '"');
      const nonEmpty = [];
      for (let c = 2; c <= 34; c++) {
        if (cpeRows[r][c] && cpeRows[r][c].trim()) nonEmpty.push(c);
      }
      console.log('  Update section filled cols:', nonEmpty);
    }
  }
}
console.log('Total CPE rows with Update section data:', cpeUpdateCount);

// Also check by status value
let cpeUpdatingCount = 0;
for (let r = 1; r < cpeRows.length; r++) {
  const statusCol = (cpeRows[r][cpeStatusColIdx] || '').trim();
  if (statusCol === 'Updating Records') cpeUpdatingCount++;
}
console.log('CPE rows with status="Updating Records":', cpeUpdatingCount);

// Certification column comparison
console.log('\n=== CERTIFICATION COLUMN COMPARISON ===');
console.log('CPE col[7] (Update):', cpeRows[0][7]);
console.log('CPE col[58] (New Alumni):', cpeRows[0][58]);
console.log('EE col[8] (Update):', eeRows[0][8]);
console.log('EE col[60] (New Alumni):', eeRows[0][60]);
