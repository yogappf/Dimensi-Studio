sed -i 's/import {/import {\n  updateReviewInFirestore,/g' src/App.tsx
sed -i '/await updateBookingInFirestore(orderId, updates);/a \      if (updates.showInTestimonials !== undefined || updates.rating !== undefined || updates.review !== undefined) {\n        await updateReviewInFirestore(orderId, updates as any);\n      }' src/App.tsx
