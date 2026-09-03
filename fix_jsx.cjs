const fs = require('fs');
let code = fs.readFileSync('src/components/ConsumerDashboard.tsx', 'utf8');

code = code.replace(
  /onClick=\{\(\) => \{\\n                            if \(window\.confirm\(\`Hapus ulasan dari \$\{order\.clientName\}\?\`\)\) \{\\n                              if \(onDeleteReview\) \{\\n                                onDeleteReview\(order\.id\);\\n                              \} else if \(onUpdateOrder\) \{\\n                                onUpdateOrder\(order\.id, \{\\n                                  rating: undefined,\\n                                  review: undefined,\\n                                  reviewedAt: undefined,\\n                                  showInTestimonials: undefined,\\n                                \}\);\\n                              \}\\n                            \}\\n                          \}\}/,
  `onClick={() => {
                            if (window.confirm(\`Hapus ulasan dari \${order.clientName}?\`)) {
                              if (onDeleteReview) {
                                onDeleteReview(order.id);
                              } else if (onUpdateOrder) {
                                onUpdateOrder(order.id, {
                                  rating: undefined,
                                  review: undefined,
                                  reviewedAt: undefined,
                                  showInTestimonials: undefined,
                                });
                              }
                            }
                          }}`
);

fs.writeFileSync('src/components/ConsumerDashboard.tsx', code);
