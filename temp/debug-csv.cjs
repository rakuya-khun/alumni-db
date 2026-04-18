const fs = require('fs');

const raw = fs.readFileSync('temp/Raw Data for Alumni Database - CE.csv', 'utf8');
const lines = raw.split(/\r?\n/);

console.log('Number of lines:', lines.length);
console.log('Line 0 length:', lines[0].length);
console.log('Line 0 first 200 chars:', JSON.stringify(lines[0].substring(0, 200)));
console.log('Line 0 last 200 chars:', JSON.stringify(lines[0].substring(lines[0].length - 200)));

// Count commas in first line
const commaCount = (lines[0].match(/,/g) || []).length;
console.log('Commas in line 0:', commaCount);

// Check if it's tab-separated
const tabCount = (lines[0].match(/\t/g) || []).length;
console.log('Tabs in line 0:', tabCount);

// Check BOM
console.log('First 3 bytes:', Buffer.from(lines[0].substring(0, 3)).toString('hex'));

// Try line 1 too
if (lines.length > 1) {
  console.log('\nLine 1 length:', lines[1].length);
  console.log('Line 1 first 200 chars:', JSON.stringify(lines[1].substring(0, 200)));
  console.log('Commas in line 1:', (lines[1].match(/,/g) || []).length);
}
