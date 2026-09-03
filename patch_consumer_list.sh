cat << 'INNER_EOF' > patch_consumer_temp.ts
// TEMPORARY REPLACEMENT SCRIPT
const fs = require('fs');
let content = fs.readFileSync('src/components/ConsumerDashboard.tsx', 'utf8');

const sourceDataStr = `
  const reviewSourceData = reviews?.length ? reviews : orders.filter(o => o.review || o.rating);
`;

content = content.replace(
  "const [activeSubTab, setActiveSubTab] = useState<'table' | 'reviews'>('table');",
  "const [activeSubTab, setActiveSubTab] = useState<'table' | 'reviews'>('table');\n" + sourceDataStr
);

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
  /{orders\s*\.filter\(\(o\) => o\.review \|\| o\.rating\)/,
  "{reviewSourceData"
);

fs.writeFileSync('src/components/ConsumerDashboard.tsx', content);
INNER_EOF
node patch_consumer_temp.ts
