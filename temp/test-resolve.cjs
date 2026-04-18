// Simulate the mapper's resolveHeaderColumn for the actual headers
function stripQuestionNumber(header) {
  return header.replace(/^\d+[a-z]?(?:[./]\d+[a-z]?)?\.?\s*/i, '').trim()
}

const testHeaders = [
  '26. How did you obtain your first job?',
  '27. Challenges encountered in finding your first job',
  '37. How did you obtain your first job?',
  '38. Challenges encountered in finding your first job',
  '25. How long did it take you to find your first job after graduation?',
  '36. How long did it take you to find your first job after graduation?',
];

const HEADER_TO_COLUMN = {
  'how did you obtain your first job?': 'first_job_method',
  'what challenges did you face in finding your first job?': 'job_challenges',
  'how long did it take you to find your first job after graduation?': 'time_to_first_job',
};

for (const raw of testHeaders) {
  const header = raw.toLowerCase().trim();
  
  // Step 2: Exact match
  const exact = HEADER_TO_COLUMN[header];
  
  // Step 3: Stripped
  const stripped = stripQuestionNumber(header);
  const strippedMatch = HEADER_TO_COLUMN[stripped];
  
  // Step 6: Keyword fallback
  const s = stripped.toLowerCase();
  let keyword = null;
  if ((s.includes('how long') || (s.includes('when') && s.includes('obtain'))) && s.includes('first job')) keyword = 'time_to_first_job';
  if (s.includes('how') && s.includes('obtain') && s.includes('first job')) keyword = 'first_job_method';
  if (s.includes('first job') && s.includes('since graduating')) keyword = 'is_first_job';
  if (s.includes('challenge') && s.includes('first job')) keyword = 'job_challenges';
  
  console.log(`"${raw}"`);
  console.log(`  exact: ${exact || 'NONE'}`);
  console.log(`  stripped: "${stripped}" → ${strippedMatch || 'NONE'}`);
  console.log(`  keyword: ${keyword || 'NONE'}`);
  console.log();
}
