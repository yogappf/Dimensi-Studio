const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// The first occurrence is in CustomerPortal
code = code.replace(
  /onUpdateOrder=\{handleUpdateOrder\}\s+onDeleteReview=\{handleDeleteReview\}/,
  'onUpdateOrder={handleUpdateOrder}'
);

fs.writeFileSync('src/App.tsx', code);
