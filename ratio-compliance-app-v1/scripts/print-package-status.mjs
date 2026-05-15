import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const importantFiles = [
  'src/app/RatioComplianceApp.tsx',
  'src/core/compliance/calculateCompliance.ts',
  'src/core/compliance/standardsEvaluation.ts',
  'src/core/standards/builtInTexasLicensedChildCareHome.ts',
  'src/core/age/ageBuckets.ts',
  'src/core/export/exporters.ts',
];

console.log('Ratio Compliance App package status');
console.log(`Root: ${root}`);
console.log('');
for (const file of importantFiles) {
  const full = path.join(root, file);
  console.log(`${fs.existsSync(full) ? 'OK ' : 'MISS'} ${file}`);
}
console.log('');
console.log('FINAL ACTION: run npm install, then npm run dev or npm run build.');
