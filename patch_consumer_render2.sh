sed -i 's/orders.filter(o => o.review || o.rating).length/reviewSourceData.length/g' src/components/ConsumerDashboard.tsx
sed -i 's/orders.filter((o) => o.review || o.rating).length/reviewSourceData.length/g' src/components/ConsumerDashboard.tsx
sed -i 's/orders.filter(o => (o.review || o.rating) && o.showInTestimonials !== false).length/reviewSourceData.filter(o => o.showInTestimonials !== false).length/g' src/components/ConsumerDashboard.tsx
sed -i 's/orders.filter(o => (o.review || o.rating) && o.showInTestimonials === false).length/reviewSourceData.filter(o => o.showInTestimonials === false).length/g' src/components/ConsumerDashboard.tsx
