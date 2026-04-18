const fs = require('fs');
function p(t) {
  const r = []; let w = []; let f = ''; let q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) {
      if (c === '"' && t[i+1] === '"') { f += '"'; i++; }
      else if (c === '"') { q = false; }
      else { f += c; }
    } else {
      if (c === '"') { q = true; }
      else if (c === ',') { w.push(f); f = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && t[i+1] === '\n') i++;
        w.push(f); r.push(w); w = []; f = '';
      } else { f += c; }
    }
  }
  if (f || w.length) { w.push(f); r.push(w); }
  return r;
}
const t = fs.readFileSync('temp/Raw Data for Alumni Database - CE.csv', 'utf8');
const r = p(t);
console.log('CE total cols:', r[0].length);
r[0].forEach((h, i) => {
  console.log('[' + i + '] ' + h.replace(/\n/g, ' ').substring(0, 100));
});
