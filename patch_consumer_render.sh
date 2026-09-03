cat << 'INNER_EOF' > patch_consumer_temp.ts
const fs = require('fs');
let content = fs.readFileSync('src/components/ConsumerDashboard.tsx', 'utf8');

// replace orders.filter(...) with reviewSourceData
content = content.replace(
  /orders\.filter\(o => o\.review \|\| o\.rating\)\.length/g,
  "reviewSourceData.length"
);

content = content.replace(
  /orders\.filter\(o => \(o\.review \|\| o\.rating\) && o\.showInTestimonials !== false\)\.length/g,
  "reviewSourceData.filter(o => o.showInTestimonials !== false).length"
);

content = content.replace(
  /orders\.filter\(o => \(o\.review \|\| o\.rating\) && o\.showInTestimonials === false\)\.length/g,
  "reviewSourceData.filter(o => o.showInTestimonials === false).length"
);

content = content.replace(
  /\{orders\n\s*\.filter\(\(o\) => o\.review \|\| o\.rating\)/g,
  "{reviewSourceData"
);

content = content.replace(
  /orders\.filter\(\(o\) => o\.review \|\| o\.rating\)/g,
  "reviewSourceData"
);

fs.writeFileSync('src/components/ConsumerDashboard.tsx', content);
INNER_EOF
npx tsx patch_consumer_temp.ts
