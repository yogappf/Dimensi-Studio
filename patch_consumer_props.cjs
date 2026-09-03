const fs = require('fs');
let code = fs.readFileSync('src/components/ConsumerDashboard.tsx', 'utf8');

code = code.replace(
  /onUpdateOrder\?: \(orderId: string, updates: Partial<BookingOrder>\) => void;/,
  'onUpdateOrder?: (orderId: string, updates: Partial<BookingOrder>) => void;\n  onDeleteReview?: (orderId: string) => void;'
);

code = code.replace(
  /onUpdateOrder,\n  onDeleteOrder,/,
  'onUpdateOrder,\n  onDeleteReview,\n  onDeleteOrder,'
);

// find the Hapus Ulasan button
code = code.replace(
  /onClick=\{\(\) => \{\n\s*if \(window\.confirm\(\`Hapus ulasan dari \$\{order\.clientName\}\?\`\)\) \{\n\s*if \(onUpdateOrder\) \{\n\s*onUpdateOrder\(order\.id, \{\n\s*rating: undefined,\n\s*review: undefined,\n\s*reviewedAt: undefined,\n\s*showInTestimonials: undefined,\n\s*\}\);\n\s*\}\n\s*\}\n\s*\}\}/,
  "onClick={() => {\\n                            if (window.confirm(`Hapus ulasan dari ${order.clientName}?`)) {\\n                              if (onDeleteReview) {\\n                                onDeleteReview(order.id);\\n                              } else if (onUpdateOrder) {\\n                                onUpdateOrder(order.id, {\\n                                  rating: undefined,\\n                                  review: undefined,\\n                                  reviewedAt: undefined,\\n                                  showInTestimonials: undefined,\\n                                });\\n                              }\\n                            }\\n                          }}"
);

fs.writeFileSync('src/components/ConsumerDashboard.tsx', code);
