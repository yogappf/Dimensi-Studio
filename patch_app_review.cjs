const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const handleDeleteReviewCode = `
  const handleDeleteReview = async (orderId: string) => {
    try {
      await deleteReviewFromFirestore(orderId);
      // Also clean up from local orders state if needed
      setOrders((prev) =>
        prev.map((ord) =>
          ord.id === orderId
            ? { ...ord, review: undefined, rating: undefined, showInTestimonials: undefined, reviewedAt: undefined }
            : ord
        )
      );
      // Clean up in Firebase bookings
      const { doc, updateDoc, deleteField } = await import('firebase/firestore');
      const { db } = await import('./firebase/config');
      const docRef = doc(db, 'bookings', orderId);
      await updateDoc(docRef, {
        review: deleteField(),
        rating: deleteField(),
        showInTestimonials: deleteField(),
        reviewedAt: deleteField()
      }).catch(() => {});
    } catch (err) {
      console.error('Error deleting review:', err);
    }
  };
`;

code = code.replace(
  /\/\/ Admin manual order addition/,
  handleDeleteReviewCode + '\n  // Admin manual order addition'
);

code = code.replace(
  /onUpdateOrder=\{handleUpdateOrder\}/g,
  'onUpdateOrder={handleUpdateOrder}\n              onDeleteReview={handleDeleteReview}'
);

fs.writeFileSync('src/App.tsx', code);
