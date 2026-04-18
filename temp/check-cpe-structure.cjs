// Check the CPE header at col 42 and col 86
const fs = require('fs');
const path = require('path');

function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { field += ch; }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === ',') { row.push(field); field = ''; }
      else if (ch === '\n' || (ch === '\r' && text[i + 1] === '\n')) {
        if (ch === '\r') i++;
        row.push(field); field = '';
        rows.push(row); row = [];
      } else { field += ch; }
    }
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const data = fs.readFileSync(path.join(__dirname, 'Raw Data for Alumni Database - CPE.csv'), 'utf8');
const records = parseCSV(data);

// The CPE CSV header at col 86 says "What is your status?" which is the status question
// Col 35 is the "New Alumni" full name (col header says "1. Full Name (Surname, Given Name, M.I)")
// Col 42 is "8. Degree and Program/Course Taken"
// Col 43 is "9. Year Graduated (ex. 2018)"

console.log('CPE Header[35]:', JSON.stringify(records[0][35]));
console.log('CPE Header[42]:', JSON.stringify(records[0][42]));
console.log('CPE Header[43]:', JSON.stringify(records[0][43]));
console.log('CPE Header[86]:', JSON.stringify(records[0][86]));

// Check: the CPE form has TWO sections - Update (cols 2-34ish) and New (cols 35-85ish)
// The "status" field is at col[86] for CPE (at the END), but at col[2] for EE (at the START)
console.log('');
console.log('Row 6 status (col[86]):', JSON.stringify(records[6][86]));
console.log('Row 6 full_name new section (col[35]):', JSON.stringify(records[6][35]));
console.log('Row 6 program (col[42]):', JSON.stringify(records[6][42]));
console.log('Row 6 year_graduated (col[43]):', JSON.stringify(records[6][43]));

// The question is: does CPE Col[2] also map to full_name?
console.log('');
console.log('CPE Header[2]:', JSON.stringify(records[0][2]));
console.log('Row 6 col[2]:', JSON.stringify(records[6][2]));
