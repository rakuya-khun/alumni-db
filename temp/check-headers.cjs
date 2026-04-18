const fs = require('fs');

function parseHeaders(file) {
  const csv = fs.readFileSync(file, 'utf8');
  const lines = csv.split('\n');
  
  // The CE sheet has 2 header rows: old alumni (row 1) and new alumni (row 2?)
  // Check first few lines
  console.log('  Line 0 length:', lines[0].length, 'first 200 chars:', lines[0].substring(0,200));
  console.log('  Line 1 length:', lines[1] ? lines[1].length : 0, 'first 200 chars:', lines[1] ? lines[1].substring(0,200) : '');
  console.log('  Total lines:', lines.length);
  
  // Check if line 0 has lots of commas 
  const commas0 = (lines[0].match(/,/g) || []).length;
  console.log('  Commas in line 0:', commas0);
}

const files = [
  'temp/Raw Data for Alumni Database - CE.csv',
  'temp/Raw Data for Alumni Database - CPE.csv',
  'temp/Raw Data for Alumni Database - EE.csv'
];

for (const file of files) {
  console.log('\n=== ' + file.split(' - ')[1] + ' ===');
  const headers = parseHeaders(file);
  // Show headers around columns 25-40 where employment questions are
  headers.forEach((h, i) => {
    if (i >= 20 && i <= 45) {
      console.log(`  [${i}] "${h}"`);
    }
  });
  console.log(`  Total headers: ${headers.length}`);
}
