const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /updateReviewInFirestore,/,
  'updateReviewInFirestore,\n  deleteReviewFromFirestore,'
);

code = code.replace(
  /await deleteBookingFromFirestore\(orderId\);/,
  'await deleteBookingFromFirestore(orderId);\n      await deleteReviewFromFirestore(orderId);'
);

fs.writeFileSync('src/App.tsx', code);
