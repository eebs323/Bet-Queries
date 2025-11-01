const data = require('./processed_output.json');

console.log('Total slips:', data.slips.length);
console.log('\nSlip breakdown:');
const buckets = {};
data.slips.forEach(s => {
    buckets[s.bucket || 'Other'] = (buckets[s.bucket || 'Other'] || 0) + 1;
});
Object.entries(buckets).forEach(([k, v]) => console.log(`  ${k}: ${v}`));

console.log('\nTotal props in table:', data.filteredData.length);
console.log('\nSample slip titles:');
data.slips.slice(0, 5).forEach(s => console.log(`  - ${s.title}`));
